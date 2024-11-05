<?php
include "../koneksi.php";  // Pastikan jalur ini benar menuju skrip koneksi database Anda

// Periksa apakah form dikirim menggunakan metode POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Ambil data dari POST
    $parent = $_POST['parentId'] ?? null;
    $type = $_POST['type'] ?? '';
    $header = isset($_POST['header']) && $_POST['header'] !== '' ? $_POST['header'] : NULL;
    $body = $_POST['body'] ?? '';

    // Query SQL untuk memasukkan data ke dalam database
    $query = "INSERT INTO `data` (`parent`, `type`, `header`, `body`) VALUES (?, ?, ?, ?)";
    if ($stmt = mysqli_prepare($conn, $query)) {
        // Bind parameter
        mysqli_stmt_bind_param($stmt, "isss", $parent, $type, $header, $body);
        // Eksekusi pernyataan
        if (mysqli_stmt_execute($stmt)) {
            header("Location: dashboard.php"); // Alihkan ke dashboard jika insert berhasil
            exit();
        } else {
            echo "Error: " . mysqli_stmt_error($stmt); // Penanganan kesalahan eksekusi
        }
        // Tutup pernyataan
        mysqli_stmt_close($stmt);
    } else {
        echo "Error preparing the statement: " . mysqli_error($conn); // Penanganan kesalahan persiapan
    }
    // Tutup koneksi
    mysqli_close($conn);
}
?>
