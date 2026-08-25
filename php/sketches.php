<?php
require 'db.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$category = $_GET['category'] ?? 'all';

if ($category === 'all') {
  $stmt = $pdo->query("SELECT * FROM sketches");
} else {
  $stmt = $pdo->prepare("SELECT * FROM sketches WHERE category=?");
  $stmt->execute([$category]);
}

$sketches = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($sketches);
?>
