<?php
require 'db.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? 0;
if (!$id) { echo json_encode(['error' => 'No ID']); exit; }

$stmt = $pdo->prepare("DELETE FROM users WHERE id=?");
$stmt->execute([$id]);
echo json_encode(['success' => true]);
?>
