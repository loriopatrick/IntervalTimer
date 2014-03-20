var app = angular.module('olumpu', ['ui']);

app.controller('Main', function ($scope) {
    $scope.intervals = [];

    var current = 0;
    $scope.nextInterval = function () {
        if (current >= $scope.intervals.length) {
            return null;
        }

        return $scope.intervals[current++];
    };

    $scope.clear = function () {
        current = 0;
        for (var i = 0; i < $scope.intervals.length; ++i) {
            $scope.intervals[i].progress = 0;
        }
    };
});