<?php
// CORS and JSON Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$apiKey = getenv('ASAAS_API_KEY') ?: base64_decode('JGFhY3RfcHJvZF8wMDBNemt3T0RBMk1XWTJPR00zTVdSbE1EVTJOV00zTXpKbE56Wm1OR1poWkdZNk9tUXdaREkwT1RnMExUY3dZVGd0TkRZMlppMDVZVEl6TFRZeU9URTBZV1V5WWpaa05qbzZKR0ZoWTJoZllXRTNNVEl3WW1NdE5EUmpZeTAwWWpOa0xUazRNakl0T0RKa00yWXdZMlU1Wmpoag==');

$email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
$paymentId = isset($_GET['payment_id']) ? trim($_GET['payment_id']) : '';

if (empty($email) && empty($paymentId)) {
    http_response_code(400);
    echo json_encode([
        'paid' => false,
        'message' => 'Parâmetro de e-mail ou identificador de pagamento não informado.'
    ]);
    exit;
}

// 1. Verificar no cache de pagamentos confirmados recebidos via Webhook
$storageFile = __DIR__ . '/confirmed_payments.json';
if (file_exists($storageFile)) {
    $confirmedList = json_decode(file_get_contents($storageFile), true);
    if (is_array($confirmedList)) {
        foreach ($confirmedList as $item) {
            $itemEmail = isset($item['email']) ? strtolower(trim($item['email'])) : '';
            $itemId = isset($item['id']) ? trim($item['id']) : '';

            $matchEmail = (!empty($email) && $itemEmail === $email);
            $matchId = (!empty($paymentId) && $itemId === $paymentId);

            if ($matchEmail || $matchId) {
                $val = isset($item['value']) ? (float)$item['value'] : 0.0;
                $plan = ($val > 50.0) ? 'annual' : 'monthly';
                echo json_encode([
                    'paid' => true,
                    'plan' => $plan,
                    'paymentId' => $itemId,
                    'value' => $val,
                    'status' => 'CONFIRMED',
                    'source' => 'webhook_cache'
                ]);
                exit;
            }
        }
    }
}

// 2. Consulta direta à API oficial do Asaas (v3)
function requestAsaas($endpoint, $apiKey) {
    $url = "https://api.asaas.com/v3/" . $endpoint;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "access_token: " . $apiKey,
        "User-Agent: NutriPlanPro-Verification/1.0"
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 12);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300 && $response) {
        return json_decode($response, true);
    }
    return null;
}

// 2.1 Se payment_id foi informado: busca direta da cobrança
if (!empty($paymentId)) {
    $res = requestAsaas("payments/" . urlencode($paymentId), $apiKey);
    if ($res && isset($res['status']) && in_array($res['status'], ['RECEIVED', 'CONFIRMED'])) {
        $val = isset($res['value']) ? (float)$res['value'] : 0.0;
        $plan = ($val > 50.0) ? 'annual' : 'monthly';
        echo json_encode([
            'paid' => true,
            'plan' => $plan,
            'paymentId' => $res['id'],
            'value' => $val,
            'status' => $res['status'],
            'source' => 'asaas_payment_id'
        ]);
        exit;
    }
}

// 2.2 Se e-mail foi informado: busca clientes cadastrados com esse e-mail no Asaas
if (!empty($email)) {
    $custData = requestAsaas("customers?email=" . urlencode($email), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $cust) {
            $customerId = $cust['id'];
            $payData = requestAsaas("payments?customer=" . urlencode($customerId) . "&status=RECEIVED,CONFIRMED", $apiKey);
            if ($payData && !empty($payData['data'])) {
                $latest = $payData['data'][0];
                $val = isset($latest['value']) ? (float)$latest['value'] : 0.0;
                $plan = ($val > 50.0) ? 'annual' : 'monthly';
                echo json_encode([
                    'paid' => true,
                    'plan' => $plan,
                    'paymentId' => $latest['id'],
                    'value' => $val,
                    'status' => $latest['status'],
                    'source' => 'asaas_customer_lookup'
                ]);
                exit;
            }
        }
    }

    // 2.3 Varredura das cobranças recentes aprovadas
    $recentPayments = requestAsaas("payments?status=RECEIVED,CONFIRMED&limit=30", $apiKey);
    if ($recentPayments && !empty($recentPayments['data'])) {
        foreach ($recentPayments['data'] as $p) {
            if (!empty($p['customer'])) {
                $c = requestAsaas("customers/" . urlencode($p['customer']), $apiKey);
                if ($c && !empty($c['email']) && strtolower(trim($c['email'])) === $email) {
                    $val = isset($p['value']) ? (float)$p['value'] : 0.0;
                    $plan = ($val > 50.0) ? 'annual' : 'monthly';
                    echo json_encode([
                        'paid' => true,
                        'plan' => $plan,
                        'paymentId' => $p['id'],
                        'value' => $val,
                        'status' => $p['status'],
                        'source' => 'asaas_recent_payments'
                    ]);
                    exit;
                }
            }
        }
    }
}

// Nenhum pagamento confirmado
echo json_encode([
    'paid' => false,
    'message' => 'Nenhum pagamento confirmado foi localizado no Asaas para o e-mail ' . htmlspecialchars($email) . '. Certifique-se de concluir o Pix ou Cartão no checkout antes de validar.'
]);
