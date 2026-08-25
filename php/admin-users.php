<?php
require 'db.php';
header('Content-Type: application/json');

$stmt = $pdo->query("SELECT id, name, email, phone, password, role FROM users");
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($users);
?>
