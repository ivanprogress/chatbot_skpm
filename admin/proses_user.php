<?php
include "../koneksi.php";
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Mengambil data dari POST
    $username = $_POST['username'] ?? '';
    $fullname = $_POST['fullname'] ?? '';
    $level = $_POST['level'] ?? '';
    $password = $_POST['password'] ?? '';

    // Memeriksa form mana yang dikirim
    if (isset($_POST['submit'])) {
        // Query SQL untuk memasukkan data ke dalam database
        $query = "INSERT INTO `user` (`USERNAME`, `PASSWORD`, `FULLNAME`, `LEVEL`) VALUES (?, ?, ?, ?)";

        // Mempersiapkan pernyataan SQL
        if ($stmt = mysqli_prepare($conn, $query)) {
            // Mengikat variabel ke pernyataan sebagai parameter
            mysqli_stmt_bind_param($stmt, "ssss", $username, $password, $fullname, $level);

            // Menjalankan pernyataan yang dipersiapkan
            if (mysqli_stmt_execute($stmt)) {
                header("Location: table_user.php"); // Mengalihkan ke tabel user setelah insert berhasil
                exit();
            } else {
                // Menangani kesalahan eksekusi
                echo "Error: " . mysqli_stmt_error($stmt);
            }

            // Menutup pernyataan
            mysqli_stmt_close($stmt);
        } else {
            // Menangani kesalahan persiapan
            echo "Error preparing the statement: " . mysqli_error($conn);
        }

    } elseif (isset($_POST['submit1'])) {
        // Mengambil data tambahan untuk update
        $id_user = $_POST['id_user'] ?? '';

        // Query SQL untuk memperbarui data dalam database
        $query = "UPDATE `user` SET `USERNAME` = ?, `PASSWORD` = ?, `FULLNAME` = ?, `LEVEL` = ? WHERE `ID_USER` = ?";

        // Mempersiapkan pernyataan SQL
        if ($stmt = mysqli_prepare($conn, $query)) {
            // Mengikat variabel ke pernyataan sebagai parameter
            mysqli_stmt_bind_param($stmt, "ssssi", $username, $password, $fullname, $level, $id_user);

            // Menjalankan pernyataan yang dipersiapkan
            if (mysqli_stmt_execute($stmt)) {
                header("Location: table_user.php"); // Mengalihkan ke tabel user setelah update berhasil
                exit();
            } else {
                // Menangani kesalahan eksekusi
                echo "Error: " . mysqli_stmt_error($stmt);
            }

            // Menutup pernyataan
            mysqli_stmt_close($stmt);
        } else {
            // Menangani kesalahan persiapan
            echo "Error preparing the statement: " . mysqli_error($conn);
        }
    }

    // Menutup koneksi database
    mysqli_close($conn);
} else {
    // Mengambil ID_USER dari GET untuk menghapus data
    $id_user = $_GET['delete_id'];
    // Query SQL untuk menghapus data dari database
    $que = "DELETE FROM `user` WHERE `ID_USER` = '$id_user'";
    // Menjalankan query
    $cekk = mysqli_query($conn, $que);
    // Memeriksa apakah penghapusan berhasil
    if ($cekk) {
        // Menampilkan pesan berhasil dihapus dan mengalihkan kembali ke tabel user
        echo "<script language='JavaScript'>
            alert('Data Berhasil Dihapus !');
            setTimeout(function() {window.location.href='table_user.php'}, 10);
            </script>";
    }
}
?>
