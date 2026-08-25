<?php
require 'db.php';
header('Content-Type: application/json');

$id     = $_POST['id'] ?? 0;
$status = $_POST['status'] ?? '';
if (!$id || !$status) { echo json_encode(['error' => 'Missing parameters']); exit; }

$stmt = $pdo->prepare("UPDATE orders SET status=? WHERE id=?");
$stmt->execute([$status, $id]);
echo json_encode(['success' => true]);
?>
