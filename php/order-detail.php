<?php
require 'db.php';
header('Content-Type: application/json');

$order_id = $_GET['order_id'] ?? 0;

if (!$order_id) {
  echo json_encode(['error' => 'Order ID required']);
  exit;
}

$stmt = $pdo->prepare("SELECT * FROM orders WHERE id = ?");
$stmt->execute([$order_id]);
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if ($order) {
  echo json_encode($order);
} else {
  echo json_encode(['error' => 'Order not found']);
}
?>
