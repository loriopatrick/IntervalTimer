var app = angular.module('olumpu');

app.directive('timer', function () {
    return {
        scope: {
            getInterval: '=',
            onClear: '='
        },
        templateUrl: 'timer.html',
        controller: function ($scope, $timeout) {
            $scope.progress = 0;
            $scope.timerStyle = {fill: 'white'};

            $scope.startTime = 0;
            $scope.totalSeconds = 0;

            $scope.running = false;
            $scope.paused = false;

            function getDelta() {
                return getTime() - $scope.startTime;
            }

            function update() {
                var delta = $scope.delta = getDelta();

                if ($scope.paused || !$scope.running) {
                    return false;
                }

                if (delta >= $scope.totalSeconds) {
                    $scope.running = false;
                    $scope.interval.progress = $scope.progress = 1;
                    $scope.nextInterval();
                    return false;
                }

                $scope.interval.progress = $scope.progress = delta / $scope.totalSeconds;
                return true;
            }

            function getTime() {
                return new Date().getTime() / 1000;
            }

            $scope.run = function (delta) {
                $scope.running = true;
                $scope.paused = false;

                $scope.startTime = getTime() - delta;

                function loop() {
                    if (!update()) return;
                    $timeout(loop, 10);
                }

                loop();
            };

            $scope.nextInterval = function () {
                $scope.interval = $scope.getInterval();

                if (!$scope.interval) {
                    $scope.clear();
                    return;
                }

                $scope.totalSeconds = $scope.interval.time.value * {
                    s: 1,
                    m: 60,
                    h: 3600
                }[$scope.interval.time.unit[0]];

                $scope.run($scope.interval.progress * $scope.totalSeconds);
            };

            $scope.start = function () {
                $scope.nextInterval();
            };

            $scope.pause = function () {
                $scope.paused = true;
            };

            $scope.resume = function () {
                $scope.run($scope.delta);
            };

            $scope.clear = function () {
                $scope.running = false;
                $scope.progress = 0;
                $scope.onClear();
            };
        }
    }
});

app.directive('pieProgress', function () {
    return {
        template: '<svg viewBox="0 0 100 100"><path d="M 0 0" ng-style="style"></path></svg>',
        scope: {
            progress: '=',
            style: '=pieStyle',
            reverse: '@'
        },
        link: function (scope, element) {
            var $path = element.find('path').first();

            function setPath(end) {
                $path.attr('d', [
                    'M 50 50',
                    'L 50 0',
                    'A 50 50 0', end.x > 51 ? 0 : 1, '1', end.x, end.y,
                    'L 50 50',
                    'Z'
                ].join(' '));
            }

            function applyProgress(progress) {
                if (progress != 0 && !progress) return;
                if (progress == 1) {
                    progress = .9999999;
                }
                if (progress == 0) {
                    progress = .0001;
                }

                var angle = Math.PI * 2 * (scope.reverse == undefined ? progress : 1 - progress);
                setPath({
                    x: Math.sin(angle) * 50 + 50,
                    y: 50 - Math.cos(angle) * 50
                });
            }

            scope.$watch('progress', applyProgress);
            applyProgress(scope.progress);
        }
    };
});

app.directive('intervals', function () {
    return {
        templateUrl: 'intervals.html',
        scope: {
            intervals: '='
        },
        link: function (scope) {
            $(document.body).on('keypress', function (e) {
                if (e.keyCode != 13) return;
                e.preventDefault();
                scope.$apply(function () {
                    scope.addInterval();
                });
            });
        },
        controller: function ($scope, $timeout) {
            $scope.sortOptions = {
                axis: 'y',
                cancel: '.disabled'
            };

            $scope.removeInterval = function (index) {
                $scope.intervals.splice(index, 1);
            };

            $scope.copyInterval = function (index) {
                var interval = $scope.intervals[index];

                var pos = -1;
                for (var i = index + 1; i < $scope.intervals.length; ++i) {
                    if ($scope.intervals[i].progress === 0) {
                        pos = i;
                        break;
                    }
                }

                if (pos == -1) {
                    pos = $scope.intervals.length;
                }

                $scope.intervals.splice(pos, 0, {
                    time: {
                        value: interval.time.value,
                        unit: interval.time.unit
                    },
                    note: interval.note,
                    progress: 0
                });
            };

            $scope.inputOpen = false;
            $scope.time = '';
            $scope.note = '';

            $scope.addInterval = function () {
                if (!$scope.time.length) {
                    $scope.inputOpen = !$scope.inputOpen;
                    if ($scope.inputOpen) {
                        $scope.focusInput = true;
                    }
                    return;
                }

                $scope.inputOpen = true;

                var regex = /^([\d\s]+)([\w\s]+)$/;
                var res = regex.exec($scope.time + 's');
                var value, unit;

                if (res != null) {
                    value = Number(res[1]);
                    unit = {s: 'second', m: 'minute', h: 'hour'}[res[2][0]];
                }

                if (!res || isNaN(value) || !unit) {
                    $scope.time = '';
                    $scope.focusInput = true;
                    return;
                }

                $scope.intervals.push({
                    time: {
                        value: value,
                        unit: unit
                    },
                    note: $scope.note,
                    progress: 0
                });

                $scope.time = '';
                $scope.note = '';
                $scope.focusInput = true;
            };
        }
    }
});

app.directive('myMaxlength', function () {
    return {
        require: 'ngModel',
        link: function (scope, element, attrs, ngModelCtrl) {
            var maxlength = Number(attrs['myMaxlength']);

            function fromUser(text) {
                if (text.length > maxlength) {
                    var transformedInput = text.substring(0, maxlength);
                    ngModelCtrl.$setViewValue(transformedInput);
                    ngModelCtrl.$render();
                    return transformedInput;
                }
                return text;
            }

            ngModelCtrl.$parsers.push(fromUser);
        }
    };
});

app.directive('onKey', function () {
    return {
        scope: {
            onKey: '='
        },
        link: function (scope, element) {
            element.on('keypress', function (e) {
                scope.$apply(function () {
                    scope.onKey(e.charCode);
                });
            });
        }
    }
});

app.directive('focusMe', function ($timeout, $parse) {
    return {
        link: function (scope, element, attr) {
            var model = $parse(attr['focusMe']);
            scope.$watch(model, function (value) {
                if (value === true) {
                    $timeout(function () {
                        element[0].focus();
                        scope.$apply(model.assign(scope, false));
                    });
                }
            });
        }
    };
});

app.directive('sound', function () {
    return {
        scope: {
            src: '=',
            play: '='
        },
        template: '<source src="{{ src }}" type="audio/wav">',
        link: function (scope, element) {
            scope.$watch('src', function (src) {
                scope.audio = new Audio(scope.src);
            });

            scope.$watch('play', function (play) {
                if (play === true) {
                    scope.audio.play();
                    scope.play = false;
                }
            });
        }
    };
});