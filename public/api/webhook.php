<?php
// CORS and JSON Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, asaas-access-token");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

$expectedToken = getenv('ASAAS_WEBHOOK_SECRET') ?: base64_decode('d2hzZWNfelpvWXl4VWdQcWNaUGRwZEk0WUVWSTJOZGhhRngySjVMMkhSUkgyZXg5MA==');

// Validação opcional de token no header ou query
$headerToken = $_SERVER['HTTP_ASAAS_ACCESS_TOKEN'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$getAccessToken = $_GET['token'] ?? '';

// Ler payload bruto
$rawInput = file_get_contents('php://input');
if (empty($rawInput)) {
    http_response_code(400);
    echo json_encode(['error' => 'Payload vazio.']);
    exit;
}

$eventData = json_decode($rawInput, true);
if (!$eventData) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido.']);
    exit;
}

// Log para auditoria
$logFile = __DIR__ . '/webhook_audit.log';
$logEntry = date('Y-m-d H:i:s') . ' | Evento: ' . ($eventData['event'] ?? 'UNKNOWN') . "\n";
@file_put_contents($logFile, $logEntry, FILE_APPEND);

// Processar eventos de pagamento confirmado
$event = $eventData['event'] ?? '';
if (in_array($event, ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'])) {
    $payment = $eventData['payment'] ?? [];
    $paymentId = $payment['id'] ?? ('pay_' . time());
    $value = isset($payment['value']) ? (float)$payment['value'] : 0.0;
    
    $customerEmail = '';
    $customerCpf = '';
    $customerName = '';
    if (!empty($payment['customerEmail'])) {
        $customerEmail = strtolower(trim($payment['customerEmail']));
    }
    if (!empty($payment['customer'])) {
        // Obter dados completos do cliente via API do Asaas
        $apiKey = getenv('ASAAS_API_KEY') ?: base64_decode('JGFhY3RfcHJvZF8wMDBNemt3T0RBMk1XWTJPR00zTVdSbE1EVTJOV00zTXpKbE56Wm1OR1poWkdZNk9tUXdaREkwT1RnMExUY3dZVGd0TkRZMlppMDVZVEl6TFRZeU9URTBZV1V5WWpaa05qbzZKR0ZoWTJoZllXRTNNVEl3WW1NdE5EUmpZeTAwWWpOa0xUazRNakl0T0RKa00yWXdZMlU1Wmpoag==');
        $ch = curl_init("https://api.asaas.com/v3/customers/" . urlencode($payment['customer']));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["access_token: " . $apiKey]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        $custResp = curl_exec($ch);
        curl_close($ch);
        if ($custResp) {
            $custObj = json_decode($custResp, true);
            if (!empty($custObj['email'])) {
                $customerEmail = strtolower(trim($custObj['email']));
            }
            if (!empty($custObj['cpfCnpj'])) {
                $customerCpf = preg_replace('/\D/', '', $custObj['cpfCnpj']);
            }
            if (!empty($custObj['name'])) {
                $customerName = trim($custObj['name']);
            }
        }
    }

    $storageFile = __DIR__ . '/confirmed_payments.json';
    $confirmed = [];
    if (file_exists($storageFile)) {
        $confirmed = json_decode(file_get_contents($storageFile), true) ?: [];
    }

    $confirmed[$paymentId] = [
        'id' => $paymentId,
        'email' => $customerEmail,
        'cpf' => $customerCpf,
        'name' => $customerName,
        'value' => $value,
        'status' => 'CONFIRMED',
        'event' => $event,
        'timestamp' => date('c')
    ];

    @file_put_contents($storageFile, json_encode($confirmed, JSON_PRETTY_PRINT));
}

http_response_code(200);
echo json_encode(['received' => true, 'timestamp' => date('c')]);
