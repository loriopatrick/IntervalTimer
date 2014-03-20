var app = angular.module('olumpu');

app.filter('deltaTime', function() {
    return function(input) {
        var hours = Math.floor(input / 3600);
        input -= hours * 3600;
        var minutes = Math.floor(input / 60);
        input -= minutes * 60;
        var seconds = Math.floor(input);
        input -= seconds;

        if (hours > 0) {
            return hours + ':' + minutes + ':' + seconds;
        }

        if (minutes > 0) {
            return minutes + ':' + seconds;
        }

        if (seconds < 5) {
            var mili = Math.round(input * 1000) + '';
            while (mili.length < 3) {
                mili += '0';
            }

            return seconds + '.' + mili;
        }

        return seconds;
    };
});