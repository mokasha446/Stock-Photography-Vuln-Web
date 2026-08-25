<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$user_id   = $_POST['user_id']   ?? 0;
$sketch_id = $_POST['sketch_id'] ?? 0;
$name      = $_POST['name']      ?? '';
$phone     = $_POST['phone']     ?? '';
$address   = $_POST['address']   ?? '';
$amount    = $_POST['amount']    ?? 0; // VULN: price from frontend
$plan      = $_POST['plan']      ?? '';
$notes     = $_POST['notes']     ?? '';
$payment   = $_POST['payment']   ?? '';
$photo     = '';

// VULN: Unrestricted file upload
if (!empty($_FILES['photo']['name'])) {
  $upload_dir = '../images/uploads/';
  if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);
  $filename = $_FILES['photo']['name']; // VULN: original name kept
  move_uploaded_file($_FILES['photo']['tmp_name'], $upload_dir.$filename);
  $photo = $filename;
}

try {
  $stmt = $pdo->prepare("INSERT INTO orders (user_id,sketch_id,buyer_name,phone,address,amount,plan,notes,photo,payment) VALUES (?,?,?,?,?,?,?,?,?,?)");
  $stmt->execute([$user_id,$sketch_id,$name,$phone,$address,$amount,$plan,$notes,$photo,$payment]);
  echo json_encode(['success' => true, 'order_id' => $pdo->lastInsertId()]);
} catch(PDOException $e) {
  echo json_encode(['error' => $e->getMessage()]);
}
?>
