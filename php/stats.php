<?php
require 'db.php';
header('Content-Type: application/json');

$orders   = $pdo->query("SELECT COUNT(*) as count, COALESCE(SUM(amount),0) as revenue FROM orders")->fetch();
$users    = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch();
$sketches = $pdo->query("SELECT COUNT(*) as count FROM sketches")->fetch();

echo json_encode([
  'orders'   => $orders['count'],
  'revenue'  => $orders['revenue'],
  'users'    => $users['count'],
  'sketches' => $sketches['count']
]);
?>
