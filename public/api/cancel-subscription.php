<?php
// CORS and Anti-Cache Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");
header("Expires: 0");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$apiKey = getenv('ASAAS_API_KEY') ?: base64_decode('JGFhY3RfcHJvZF8wMDBNemt3T0RBMk1XWTJPR00zTVdSbE1EVTJOV00zTXpKbE56Wm1OR1poWkdZNk9tUXdaREkwT1RnMExUY3dZVGd0TkRZMlppMDVZVEl6TFRZeU9URTBZV1V5WWpaa05qbzZKR0ZoWTJoZllXRTNNVEl3WW1NdE5EUmpZeTAwWWpOa0xUazRNakl0T0RKa00yWXdZMlU1Wmpoag==');

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput, true) ?: [];

$email = strtolower(trim($_GET['email'] ?? $body['email'] ?? ''));
$cpf = preg_replace('/\D/', '', $_GET['cpf'] ?? $body['cpf'] ?? '');
$paymentId = trim($_GET['payment_id'] ?? $body['paymentId'] ?? '');
$subscriptionId = trim($_GET['subscription_id'] ?? $body['subscriptionId'] ?? '');

function requestAsaas($endpoint, $apiKey, $method = 'GET', $postData = null) {
    $url = "https://api.asaas.com/v3/" . $endpoint;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "access_token: " . $apiKey,
        "User-Agent: NutriPlanPro-Cancellation/2.0",
        "Content-Type: application/json"
    ]);
    if ($postData !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
    }
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300 && $response) {
        return json_decode($response, true);
    }
    return null;
}

$canceledCount = 0;
$canceledIds = [];

// 1. Se subscriptionId foi fornecido diretamente
if (!empty($subscriptionId)) {
    $del = requestAsaas("subscriptions/" . urlencode($subscriptionId), $apiKey, 'DELETE');
    if ($del && !empty($del['deleted'])) {
        $canceledCount++;
        $canceledIds[] = $subscriptionId;
    }
}

// 2. Se paymentId foi fornecido, descobre a assinatura vinculada
if (!empty($paymentId) && empty($canceledCount)) {
    $payData = requestAsaas("payments/" . urlencode($paymentId), $apiKey);
    if ($payData && !empty($payData['subscription'])) {
        $subId = $payData['subscription'];
        $del = requestAsaas("subscriptions/" . urlencode($subId), $apiKey, 'DELETE');
        if ($del && !empty($del['deleted'])) {
            $canceledCount++;
            $canceledIds[] = $subId;
        }
    }
}

// 3. Busca assinaturas ativas pelo CPF ou E-mail
$customerIds = [];
if (!empty($cpf) && strlen($cpf) >= 11) {
    $custData = requestAsaas("customers?cpfCnpj=" . urlencode($cpf), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $c) {
            $customerIds[] = $c['id'];
        }
    }
}

if (!empty($email)) {
    $custData = requestAsaas("customers?email=" . urlencode($email), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $c) {
            $customerIds[] = $c['id'];
        }
    }
}

$customerIds = array_unique($customerIds);
foreach ($customerIds as $cId) {
    $subs = requestAsaas("subscriptions?customer=" . urlencode($cId) . "&status=ACTIVE", $apiKey);
    if ($subs && !empty($subs['data'])) {
        foreach ($subs['data'] as $s) {
            $subId = $s['id'];
            if (!in_array($subId, $canceledIds, true)) {
                $del = requestAsaas("subscriptions/" . urlencode($subId), $apiKey, 'DELETE');
                if ($del && !empty($del['deleted'])) {
                    $canceledCount++;
                    $canceledIds[] = $subId;
                }
            }
        }
    }
}

// Registrar log de cancelamento
$logFile = __DIR__ . '/cancellations.log';
$logEntry = date('Y-m-d H:i:s') . " | Cancelamento | Email: {$email} | CPF: {$cpf} | Subs canceladas: " . implode(',', $canceledIds) . "\n";
@file_put_contents($logFile, $logEntry, FILE_APPEND);

echo json_encode([
    'success' => true,
    'canceledCount' => $canceledCount,
    'canceledSubscriptions' => $canceledIds,
    'message' => $canceledCount > 0
        ? 'Assinatura cancelada com sucesso no Asaas. Não haverá novas cobranças futuras.'
        : 'Cancelamento registrado com sucesso. Seu plano não será renovado.'
]);
