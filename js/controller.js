var app = angular.module('olumpu', ['ui.sortable']);

app.controller('Main', function ($scope) {
    $scope.intervals = [];

    var current = 0;
    $scope.nextInterval = function () {
        if (current >= $scope.intervals.length) {
            $scope.playDone = true;
            return null;
        } else if (current != 0) {
            $scope.playTick = true;
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