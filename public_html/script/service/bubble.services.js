'use strict';
angular.module('myApp')
        .factory('MyApiService', myApiService);

myApiService.$inject = [
    '$http',
    '$q'

];

/* Service function for making request and to fetch data.... */
function myApiService(
        $http,
        $q
        ) {
    return{
        getBubbleChartData: getBubbleChartData
    };
/* Function to get the Data from API */
    function getBubbleChartData(parameter) {
        //adding loader to the page 
       document.getElementById('error-msg').style.display = 'none';
       document.getElementById('loader').style.display = 'block';
       
        var apiUrl = 'http://13.79.129.179:5010/api/bubble_list';
        var request = $http({
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            url: apiUrl,
            data: parameter

        });

        return(request.then(getBubbleChartDataSuccess)
                .catch(getBubbleChartDataError));

        /*getBubbledata error function*/
        function getBubbleChartDataError(response) {
            if (!angular.isObject(response.data) || !response.data.message) {
                return($q.reject(response.data));
            }
            /*Otherwise, use expected error message.*/
            return($q.reject(response.data.message));
        }

        /*getBubbleData success function*/
        function getBubbleChartDataSuccess(response) {
            return(response);
        }
    } // send $http request to save student
}