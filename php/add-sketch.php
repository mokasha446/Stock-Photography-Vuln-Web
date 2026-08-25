<?php
error_log('POST: ' . print_r($_POST, true));
error_log('FILES: ' . print_r($_FILES, true));
require 'db.php';
header('Content-Type: application/json');

$title    = $_POST['title']    ?? '';
$artist   = $_POST['artist']   ?? '';
$category = $_POST['category'] ?? 'portrait';
$price    = $_POST['price']    ?? 0;

$upload_dir = '../images/sketches/';
if (!is_dir($upload_dir)) mkdir($upload_dir, 0777, true);

// Main image
$mainImage = '';
if (!empty($_FILES['image']['name']) && $_FILES['image']['error'] === 0) {
  $filename = time() . '_main_' . $_FILES['image']['name'];
  move_uploaded_file($_FILES['image']['tmp_name'], $upload_dir . $filename);
  $mainImage = $filename;
}

$allImages = [];
if ($mainImage) $allImages[] = $mainImage;

// Extra 1
if (!empty($_FILES['extra1']['name']) && $_FILES['extra1']['error'] === 0) {
  $filename = time() . '_ref1_' . $_FILES['extra1']['name'];
  move_uploaded_file($_FILES['extra1']['tmp_name'], $upload_dir . $filename);
  $allImages[] = $filename;
}

// Extra 2
if (!empty($_FILES['extra2']['name']) && $_FILES['extra2']['error'] === 0) {
  $filename = time() . '_ref2_' . $_FILES['extra2']['name'];
  move_uploaded_file($_FILES['extra2']['tmp_name'], $upload_dir . $filename);
  $allImages[] = $filename;
}

// Extra 3
if (!empty($_FILES['extra3']['name']) && $_FILES['extra3']['error'] === 0) {
  $filename = time() . '_ref3_' . $_FILES['extra3']['name'];
  move_uploaded_file($_FILES['extra3']['tmp_name'], $upload_dir . $filename);
  $allImages[] = $filename;
}

$imagesString = implode(',', $allImages);

if (empty($title) || empty($price)) {
  echo json_encode(['error' => 'Title and price required']);
  exit;
}

$stmt = $pdo->prepare("INSERT INTO sketches (title, artist, category, price, image, images) VALUES (?,?,?,?,?,?)");
$stmt->execute([$title, $artist, $category, $price, $mainImage, $imagesString]);
echo json_encode(['success' => true, 'id' => $pdo->lastInsertId(), 'count' => count($allImages)]);
?>