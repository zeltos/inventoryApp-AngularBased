<?php
	$host="localhost";
	$username="root";
	$password="";
	$databasename="inventory";
	$koneksi=mysql_connect($host,$username,$password) or die ("DatabaseError");
	mysql_select_db($databasename,$koneksi);
?>
