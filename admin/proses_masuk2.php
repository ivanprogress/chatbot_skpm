<?php
include "../koneksi.php";
if (isset($_POST['submit']))
{
	$tanggal = $_POST['tanggal'];
	$sebab = $_POST['sebab'];
	$keterangan = $_POST['keterangan'];
	$pengeluaran = $_POST['nominal'];
	$id_mobil = $_POST['id_mobil'];

	$q = "INSERT INTO `pengeluaran` (`id_pengeluaran`, `tgl`, `id_sebab`, `keterangan`, `nominal`, `id_mobil`) VALUES (NULL, '$tanggal', '$sebab', '$keterangan', '$pengeluaran', '$id_mobil')";
	$ck= mysqli_query($conn,$q);
	if ($ck)
	{
	header ("location:table_masuk2.php");
	}
}
elseif(isset($_POST['submit1']))
	{
		$id_pengeluaran = $_POST['id_pengeluaran'];
		$tanggal = $_POST['tanggal'];
		$sebab = $_POST['sebab'];
		$keterangan = $_POST['keterangan'];
		$pengeluaran = $_POST['nominal'];
		$id_mobil = $_POST['id_mobil'];

	$qu= "UPDATE `pengeluaran` SET `tgl` = '$tanggal', `id_sebab` = '$sebab', `keterangan` = '$keterangan', `nominal` = '$pengeluaran', `id_mobil` = '$id_mobil' WHERE `id_pengeluaran` = '$id_pengeluaran'";
	$cek=mysqli_query($conn,$qu);
	if($cek)
	{
	header ("location:table_masuk2.php");
	}
}
else
{
	$id_dtw = $_GET['delete_id'];
	$que = "DELETE FROM `pengeluaran` WHERE `id_pengeluaran` = '$id_dtw'";
	$cekk=mysqli_query($conn,$que);
	if($cekk)
	{
		echo "<script language='JavaScript'>
        alert('Data Berhasil Dihapus !');
        setTimeout(function() {window.location.href='table_masuk2.php'},10);
        </script>";
	}

}
?>
