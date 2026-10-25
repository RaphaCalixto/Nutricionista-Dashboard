<?php
// CORS and Strict Anti-Cache Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
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

$email = isset($_GET['email']) ? strtolower(trim($_GET['email'])) : '';
$payerEmail = isset($_GET['payer_email']) ? strtolower(trim($_GET['payer_email'])) : '';
$cpf = isset($_GET['cpf']) ? preg_replace('/\D/', '', $_GET['cpf']) : '';
$paymentId = isset($_GET['payment_id']) ? trim($_GET['payment_id']) : '';
$name = isset($_GET['name']) ? trim($_GET['name']) : '';

function requestAsaas($endpoint, $apiKey) {
    $url = "https://api.asaas.com/v3/" . $endpoint;
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "access_token: " . $apiKey,
        "User-Agent: NutriPlanPro-Verification/2.0"
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

function returnSuccess($plan, $paymentId, $val, $status, $source, $customerName = '') {
    echo json_encode([
        'paid' => true,
        'plan' => $plan,
        'paymentId' => $paymentId,
        'value' => $val,
        'status' => $status,
        'customerName' => $customerName,
        'source' => $source
    ]);
    exit;
}

// 1. Busca por payment_id direto
if (!empty($paymentId)) {
    $res = requestAsaas("payments/" . urlencode($paymentId), $apiKey);
    if ($res && isset($res['status']) && in_array($res['status'], ['RECEIVED', 'CONFIRMED'])) {
        $val = isset($res['value']) ? (float)$res['value'] : 0.0;
        $plan = ($val > 50.0) ? 'annual' : 'monthly';
        returnSuccess($plan, $res['id'], $val, $res['status'], 'payment_id');
    }
}

// 2. Busca no cache local de pagamentos confirmados do Webhook (confirmed_payments.json)
$storageFile = __DIR__ . '/confirmed_payments.json';
if (file_exists($storageFile)) {
    $confirmed = json_decode(@file_get_contents($storageFile), true) ?: [];
    $allEmails = array_filter(array_unique([$email, $payerEmail]));
    foreach ($confirmed as $pid => $data) {
        $cEmail = strtolower(trim($data['email'] ?? ''));
        $cCpf = preg_replace('/\D/', '', $data['cpf'] ?? '');

        $matchPaymentId = (!empty($paymentId) && $pid === $paymentId);
        $matchEmail = (!empty($cEmail) && in_array($cEmail, $allEmails, true));
        $matchCpf = (!empty($cpf) && $cCpf === $cpf);

        if ($matchPaymentId || $matchEmail || $matchCpf) {
            $val = (float)($data['value'] ?? 0);
            returnSuccess($val > 50.0 ? 'annual' : 'monthly', $pid, $val, 'CONFIRMED', 'webhook_cache');
        }
    }
}

// Helper para verificar cobranças confirmadas e assinaturas ativas de um cliente Asaas
function checkCustomerCharges($customerId, $customerName, $apiKey, $sourceName) {
    // A. Cobranças com status RECEIVED ou CONFIRMED
    $payData = requestAsaas("payments?customer=" . urlencode($customerId) . "&status=RECEIVED,CONFIRMED", $apiKey);
    if ($payData && !empty($payData['data'])) {
        $latest = $payData['data'][0];
        $val = isset($latest['value']) ? (float)$latest['value'] : 0.0;
        $plan = ($val > 50.0) ? 'annual' : 'monthly';
        returnSuccess($plan, $latest['id'], $val, $latest['status'], $sourceName, $customerName);
    }

    // B. Assinaturas ativas no Asaas
    $subData = requestAsaas("subscriptions?customer=" . urlencode($customerId) . "&status=ACTIVE", $apiKey);
    if ($subData && !empty($subData['data'])) {
        $latest = $subData['data'][0];
        $val = isset($latest['value']) ? (float)$latest['value'] : 0.0;
        $cycle = strtolower($latest['cycle'] ?? '');
        $plan = ($cycle === 'yearly' || $val > 50.0) ? 'annual' : 'monthly';
        returnSuccess($plan, $latest['id'], $val, 'ACTIVE', $sourceName . '_subscription', $customerName);
    }
}

// 3. Busca por CPF se fornecido (mínimo 11 dígitos)
if (!empty($cpf) && strlen($cpf) >= 11) {
    $custData = requestAsaas("customers?cpfCnpj=" . urlencode($cpf), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $cust) {
            checkCustomerCharges($cust['id'], $cust['name'] ?? '', $apiKey, 'cpf_lookup');
        }
    }
}

// 4. Busca por e-mail (da conta do usuário ou e-mail de pagador informado)
$emailsToTest = array_filter(array_unique([$email, $payerEmail]));
foreach ($emailsToTest as $targetEmail) {
    if (empty($targetEmail)) continue;

    $custData = requestAsaas("customers?email=" . urlencode($targetEmail), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $cust) {
            checkCustomerCharges($cust['id'], $cust['name'] ?? '', $apiKey, 'email_lookup');
        }
    }
}

// 5. Busca por Nome se fornecido e relevante
if (!empty($name) && strlen($name) >= 4) {
    $custData = requestAsaas("customers?name=" . urlencode($name), $apiKey);
    if ($custData && !empty($custData['data'])) {
        foreach ($custData['data'] as $cust) {
            checkCustomerCharges($cust['id'], $cust['name'] ?? '', $apiKey, 'name_lookup');
        }
    }
}

// 6. Varredura direta nas cobranças confirmadas recentes
$recentPayments = requestAsaas("payments?status=RECEIVED,CONFIRMED&limit=25", $apiKey);
if ($recentPayments && !empty($recentPayments['data'])) {
    foreach ($recentPayments['data'] as $p) {
        if (!empty($p['customer'])) {
            $c = requestAsaas("customers/" . urlencode($p['customer']), $apiKey);
            if ($c) {
                $cEmail = strtolower(trim($c['email'] ?? ''));
                $cCpf = preg_replace('/\D/', '', $c['cpfCnpj'] ?? '');
                $cName = strtolower(trim($c['name'] ?? ''));

                $matchEmail = in_array($cEmail, $emailsToTest, true);
                $matchCpf = (!empty($cpf) && $cCpf === $cpf);
                $matchName = (!empty($name) && strlen($name) >= 4 && (strpos($cName, strtolower($name)) !== false || strpos(strtolower($name), $cName) !== false));

                if ($matchEmail || $matchCpf || $matchName) {
                    $val = isset($p['value']) ? (float)$p['value'] : 0.0;
                    $plan = ($val > 50.0) ? 'annual' : 'monthly';
                    returnSuccess($plan, $p['id'], $val, $p['status'], 'recent_payment_match', $c['name'] ?? '');
                }
            }
        }
    }
}

// 7. Nenhuma confirmação localizada
echo json_encode([
    'paid' => false,
    'message' => 'Nenhum pagamento confirmado foi localizado no Asaas para os dados informados. Caso tenha utilizado outro e-mail ou CPF no momento do pagamento, informe-o para validar.'
]);
