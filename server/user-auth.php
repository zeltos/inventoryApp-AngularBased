<?php 
	
	include 'koneksi.php';
	if (isset($_GET['action']) && $_GET['action']=='login') {
		$postdata = file_get_contents("php://input");
		$request = json_decode($postdata, true);

		// print_r($request);

		$username = $request['username'];
		$password = $request['password'];

		$query = mysql_query("SELECT * FROM user WHERE username='$username' AND password='$password'");
		$row = mysql_num_rows($query);
		// echo "$data[nama_lengkap]";

		if ($row > 0) {
			$result = array("success" => true);
			echo json_encode($result);
		} else {
			$result = array("success" => false);
			echo json_encode($result);
		}		

	}
	elseif (isset($_GET['action']) && $_GET['action']=='getprofile') {
		$username = $_GET['username'];
		$query = mysql_query("SELECT nama_lengkap,iduser,email FROM user WHERE username='$username'");
		$arrayData = array();
			while ($data = mysql_fetch_array($query)) {
				$arrayData[] = $data;
			}
			echo json_encode($arrayData);
	}

 ?>