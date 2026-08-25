<?php
require 'db.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT * FROM orders ORDER BY created DESC");
$orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($orders);
?>
