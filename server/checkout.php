<?php
	
	include 'koneksi.php';
	$postdata = file_get_contents("php://input");
	$request = json_decode($postdata, true);

	$totalitem = count($request['data']['items']);
	$totalcost = $request['data']['totalCost'];
	$bayar = $request['data']['bayar'];
	$kembali = $request['data']['kembali'];

	$query = mysql_query("INSERT INTO transaksi VALUES('','$totalitem','$totalcost','$bayar','$kembali',NOW(),'0')");

	$last_id = mysql_insert_id();

	foreach ($request['data']['items'] as $key => $value) {
		$id = $value['id'];
		$quantity = $value['quantity'];		
		mysql_query("INSERT INTO detail_transaksi VALUES('$last_id','$id','$quantity')");

		// Kurangin Stok
		$viewProduk = mysql_query("SELECT * FROM produk WHERE idproduk='$id'");
		$resultView = mysql_fetch_array($viewProduk);
		$stok = $resultView['stok'];
		$totalstok = $stok - $quantity;
		$minStok = mysql_query("UPDATE produk SET stok='$totalstok' WHERE idproduk='$id'");
	}



 ?>