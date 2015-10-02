var inventoryApp = angular.module('inventoryApp', ['ngCart','chart.js' ,'ngCookies','ngSanitize','ngRoute','angularUtils.directives.dirPagination','angular-loading-bar', 'ngAnimate']);

inventoryApp.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.latencyThreshold = 500;
  });

inventoryApp.run(['$rootScope', '$location', '$cookieStore', '$http', '$route',
    function ($rootScope, $location, $cookieStore, $http, $route) {
    	$rootScope.$on('$routeChangeSuccess', function() {
	        document.title = $route.current.title;
	    });

        // keep user logged in after page refresh
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in
            if ($location.path() !== '/login' && !$rootScope.globals.currentUser) {
                $location.path('/login');
            }
        });
    }]);



// Login Controller
inventoryApp.controller('LoginController',
    ['$scope', '$rootScope', '$location', 'AuthenticationService',
    function ($scope, $rootScope, $location, AuthenticationService) {
        // reset login status        

        if ($scope.globals) {
        	 	$location.path('/');
        };

        $scope.login = function () {
            $scope.dataLoading = true;
            AuthenticationService.Login($scope.username, $scope.password, function (response) {
                if (response.success) {
                    AuthenticationService.SetCredentials($scope.username, $scope.password);
                    $location.path('/');
                } else {
                    $scope.error = response.message;
                    $scope.dataLoading = false;
                }
            });
        };
    }]);

// Factory Login
inventoryApp.factory('AuthenticationService',
    ['Base64', '$http', '$cookieStore', '$rootScope', '$timeout',
    function (Base64, $http, $cookieStore, $rootScope, $timeout) {
        var service = {};

        service.Login = function (username, password, callback) {

            /* Dummy authentication for testing, uses $timeout to simulate api call
             ----------------------------------------------*/
            // $timeout(function () {
            //     var response = { success: username === 'test' && password === 'test' };
            //     if (!response.success) {
            //         response.message = 'Username or password is incorrect';
            //     }
            //     callback(response);
            //     console.log(response);
            // }, 1000);


            /* Use this for real authentication
             ----------------------------------------------*/
            var urlServer = 'http://localhost:2205/inventoryApp/server/';        
            $http.post(urlServer + 'user-auth.php?action=login' , { username: username, password: password })
               .success(function (response) {
                   $timeout(function() {
                   		if (response.success !== true ) { 
		                   		response.message = 'Username or password is incorrect'; 
		                   } 
		                    callback(response);  
                   }, 1000 );                                      
               });

        };        

        service.SetCredentials = function (username, password) {
            var authdata = Base64.encode(username + ':' + password);

            $rootScope.globals = {
                currentUser: {
                    username: username,                    
                    authdata: authdata
                }
            };

            $http.defaults.headers.common['Authorization'] = 'Basic ' + authdata; // jshint ignore:line
            $cookieStore.put('globals', $rootScope.globals);
        };

        service.ClearCredentials = function () {
            $rootScope.globals = {};
            $cookieStore.remove('globals');
            $http.defaults.headers.common.Authorization = 'Basic ';
        };

        return service;
    }]);


// Route 
inventoryApp.config(['$routeProvider','$locationProvider','$httpProvider' ,function($routeProvider, $locationProvider, $httpProvider) {
	// $httpProvider.responseInterceptors.push('httpInterceptor');

	var baseTitle = 'InventoryApps';

	$routeProvider.when('/',{
		title 			: baseTitle,
		templateUrl		: 'template/home.html',
		activetab		: 'home'
	}).when('/transaksi',{
		title			: baseTitle + ' - transaksi',
		templateUrl		: 'template/transaksi.html',
		activetab		: 'transaksi'		
	}).when('/transaksi-list',{
		title			: baseTitle + ' - transaksi list',
		templateUrl		: 'template/transaksi-list.html',		
		activetab		: 'transaksi-list'		
	}).when('/transaksi-list/detail/:idTrans',{
		title			: baseTitle + ' - transaksi Detail',
		templateUrl		: 'template/transaksi-detail.html',
		controller 		: 'transDetailCtrl',	
		activetab		: 'transaksi-list'		 
	}).when('/report',{
		title			: baseTitle + ' - Report Inventory',
		templateUrl		: 'template/report.html',
		controller 		: 'reportCtrl',
		activetab		: 'report'			 
	}).when('/product',{
		title			: baseTitle + ' - Product list',
		templateUrl		: 'template/product-list.html',
		activetab		: 'product'			 
	}).when('/product/edit/:productId',{
		title			: baseTitle + ' - Edit Product',
		templateUrl		: 'template/product-edit.html',
		controller 		: 'ProductDetailCtrl',
		activetab		: 'product'			 
	}).when('/login',{
		title			: baseTitle + ' - Login User',
		templateUrl		: 'template/login.html',
		activetab		: 'login',	
		controller 		: 'LoginController'	 
	});

	// $locationProvider.html5Mode(true);
	// if(window.history && window.history.pushState){
	//   $locationProvider.html5Mode(true);
	// }
	
}]);

// main controler / core

inventoryApp.controller('ctrlApp', ['$scope','$rootScope','$location','ngCart','$http','invenServ','$route','cfpLoadingBar','$timeout','AuthenticationService', function ($scope, $rootScope, $location , ngCart, $http, invenServ, $route , cfpLoadingBar, $timeout, AuthenticationService) {		
   

    var urlServer = 'http://localhost:2205/inventoryApp/server/';
    $scope.productform = {};
    $scope.clearFormProduct = function() {
        $scope.productname ='';
        $scope.productprice ='';
        $scope.productstock ='';
    } 

    $scope.addProduct = function() {      
        $http.post(urlServer + 'list.php?action=add', $scope.productform)
        .success(function(response){
            $timeout(function(){
                if (response) {
                    $scope.closeForm();
                    $scope.ngCart.showdata();
                    $scope.clearFormProduct();                    
                };
            });
        });
    };

    $scope.openForm = function() {
        $('#openForm').addClass('transform-box');
    }
    $scope.closeForm = function() {
        $('#openForm').removeClass('transform-box');
    }

    $scope.deleteProduct = function(idproduk) {
        if (confirm('do you sure to delete this data?')) {
            $http.get(urlServer + 'list.php?action=delete&id=' + idproduk)
            .success(function(response) {
                if (response) {
                    $scope.ngCart.showdata();
                };
            });
        };
    }

	$scope.logout = function() {
		AuthenticationService.ClearCredentials();
		$location.path('#login')
	}

    cfpLoadingBar.start();

	$scope.currentPage = 1;
  	$scope.pageSize = 5;

  	$scope.sizePaging =[
        {showPage: 5},
        {showPage: 10},
        {showPage: 30},
        {showPage: 50}
    ];    

    $scope.$route = $route;

	$rootScope.$on('$routeChangeSuccess', function() {
    // console.log($route.current.title);
    // console.log($rootScope.$route.current);
    $timeout(function() {        
        if ($route.current.activetab !== 'login') {
            $scope.AuthenticationService = AuthenticationService;                
                $scope.getProfile = function() {
                    $http.get(urlServer + 'user-auth.php?action=getprofile&username=' + $scope.globals.currentUser.username)
                    .success(function (data, status, headers, config){
                        $timeout(function(){
                            $scope.profile = data;
                            $scope.$apply();
                        });
                    });
                };
            
                $scope.getProfile();
        };
    });
    });


	// Register service    
	$scope.ngCart = ngCart;		
	$scope.invenServ = invenServ;		

  	// Run Function on service
  	// $scope.loader = false;

	$scope.ngCart.showdata();
	$scope.invenServ.showTrans();
	$scope.invenServ.getLastTrans();
}]);

// home Controller

// Product Controller 
inventoryApp.controller('ProductDetailCtrl', ['invenServ','$scope','$routeParams','$http', function(invenServ, $scope, $routeParams , $http){
	  	var urlServer = 'http://localhost:2205/inventoryApp/server/'; 
	    $http.get( urlServer + 'list.php?action=getdetail&id=' + $routeParams.productId).success(function(data) {
	      $scope.produkdetail = data;
	    });
}]);


// Service Inventory
inventoryApp.service('invenServ', ['$rootScope','$http','ngCart','$timeout','AuthenticationService', function($rootScope, $http, ngCart, $timeout, AuthenticationService){

	

    // getTransaksi
	var urlServer = 'http://localhost:2205/inventoryApp/server/';    
	this.showTrans = function() {
		 $http.get(urlServer + 'transaksi.php?action=get')
            .success(function (data, status, headers, config) {                           
               	$timeout(function(){
               		 $rootScope.transaksi = data;
               		 // console.log(transaksi);
                	 $rootScope.$apply();
                	 $rootScope.rowtrans = $rootScope.transaksi.length;
               	});
            }).error(function(data, status,headers, config) {
                alert('gagal terhubung ke server');
            });    
	};        

	// get count new row trans 
	this.getLastTrans = function() {
		// $http.get(urlServer + 'transaksi.php?action=getnew')
  //           .success(function (data, status, headers, config) {                           
  //              	$timeout(function(){
  //              		 $rootScope.rowTrans = data;
  //               	 $rootScope.$apply();
  //              	});
  //           })
	};
	
}]);

inventoryApp.controller('transDetailCtrl', ['$scope', '$routeParams', '$http',   
  function($scope, $routeParams, $http) {
  	// Get Detail data
  	var urlServer = 'http://localhost:2205/inventoryApp/server/'; 
    $http.get( urlServer + 'transaksi.php?action=getdetail&id=' + $routeParams.idTrans).success(function(data) {
      $scope.transdetail = data;
    });
  }]);


inventoryApp.factory('Base64', function () {
    /* jshint ignore:start */

    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    return {
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            do {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output = output +
                    keyStr.charAt(enc1) +
                    keyStr.charAt(enc2) +
                    keyStr.charAt(enc3) +
                    keyStr.charAt(enc4);
                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";
            } while (i < input.length);

            return output;
        },

        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3 = "";
            var enc1, enc2, enc3, enc4 = "";
            var i = 0;

            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                window.alert("There were invalid base64 characters in the input text.\n" +
                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                    "Expect errors in decoding.");
            }
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            do {
                enc1 = keyStr.indexOf(input.charAt(i++));
                enc2 = keyStr.indexOf(input.charAt(i++));
                enc3 = keyStr.indexOf(input.charAt(i++));
                enc4 = keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }

                chr1 = chr2 = chr3 = "";
                enc1 = enc2 = enc3 = enc4 = "";

            } while (i < input.length);

            return output;
        }
    };

    /* jshint ignore:end */
});


// Report Controller
inventoryApp.controller('reportCtrl', ['$scope','invenServ','ngCart','$http','$timeout','$filter', function($scope, invenServ, ngCart, $http, $timeout,$filter){
                
      var urlServer = 'http://localhost:2205/inventoryApp/server/'; 
      $scope.getReport = function() {
        $http.get( urlServer + 'transaksi.php?action=getreport').success(function(data) {
          $scope.reports = data;
          // console.log($scope.reports.tanggal);
        });        
      };

      $scope.getReport();    

            $scope.labels = [];

      $timeout(function() {
               
            // $scope.dateconvert = $filter('date')($scope.reports.tanggal,'MMMM, dd yyyy');      
            $scope.labels = $scope.reports.tanggal;

            var jumlahreport = $scope.reports.jumlah;      
            $scope.data = [jumlahreport];
      },300);      

          
          // $scope.series = ['Series A', 'Series B'];
          // $scope.data = [
          //   [20000,500]      
          // ];
          $scope.onClick = function (points, evt) {
            console.log(points, evt);
          };
}]);


inventoryApp.controller('PieCtrl', ['$scope','invenServ','ngCart','$http','$timeout','$filter', function($scope, invenServ, ngCart, $http, $timeout,$filter){

var urlServer = 'http://localhost:2205/inventoryApp/server/'; 
      $scope.getBestProduct = function() {
        $http.get( urlServer + 'transaksi.php?action=getbestproduct').success(function(data) {
          $scope.bestproduct = data;
          // console.log($scope.reports.tanggal);
        });        
      };

      $scope.getBestProduct();

$timeout(function() {
  $scope.labels = $scope.bestproduct.produk;
  $scope.data = $scope.bestproduct.jumlah;
},500); 

}]);


jQuery(document).ready(function() {
     // $(document).on("click", ".table-click", function() {
     //     var anchorTarget = $(this).attr('data-href');
     //     window.location=anchorTarget;
     //    });
});