angular.module('MusicgeeksApp', ['ngResource', 'ngRoute'])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        controller: 'MusicgeeksController',
        templateUrl: 'views/main.html'
      });

    $locationProvider.html5Mode(true);
  })
  .filter('trustAsResourceUrl', function($sce) {
    return function(val) {
      return $sce.trustAsResourceUrl(val);
    };
  })
  .filter('trustAsHtml', function($sce) {
    return function(val) {
      return $sce.trustAsHtml(val);
    };
  })
  .factory('Song', function($resource) {
    return $resource('http://musicgeeksapi.alexsears.com/v1/songs', { apikey: 'F7284ACC3C51E' });
  })
  .controller('MusicgeeksController', function($scope, Song) {
    var artistDropdownBtn = $('#artist-dropdown-btn'),
        artistsContainer = $('#artists-container'),
        iArrow = $('#artist-dropdown-btn i'),
        soundcloudIframe = document.getElementById('soundcloud-song'),
        soundcloudWidget = {},
        footer = $('footer'),
        songIndex = 0;

    $scope.songs = Song.query(function() {
      $scope.current_song = $scope.songs[0];

      // set artist container height
      if (artistDropdownBtn.is(':visible')) {
        artistsContainer.height(window.innerHeight - artistDropdownBtn.offset().top - artistDropdownBtn.height());
      } else {
        artistsContainer.height(window.innerHeight - soundcloudIframe.height - footer.height());
      }

      soundcloudIframe.src = "https://w.soundcloud.com/player/?url=" + $scope.current_song.soundcloud_url;
      soundcloudWidget = SC.Widget(soundcloudIframe);
      soundcloudWidget.bind(SC.Widget.Events.READY, function() {
        soundcloudWidget.bind(SC.Widget.Events.FINISH, function() {
          // forces angular to see update since soundcould api
          // updates happen outside angular's digest loop
          $scope.$apply(function() {
            songIndex = (songIndex + 1) >= $scope.songs.length ? 0 : songIndex + 1;
            $scope.play($scope.songs[songIndex], false);
          });
        });
      });

      $scope.play($scope.current_song, false);
    });

    $scope.toggleArtists = function() {
      if (artistsContainer.is(':visible')) {
        artistsContainer.slideUp();
        iArrow.detach().appendTo(artistDropdownBtn);
        iArrow.removeClass('fa-angle-double-up').addClass('fa-angle-double-down');
      } else {
        artistsContainer.slideDown();
        iArrow.detach().prependTo(artistDropdownBtn);
        iArrow.removeClass('fa-angle-double-down').addClass('fa-angle-double-up');
      }
    };

    $scope.play = function(song, update_index) {
      $scope.current_song = song;
      soundcloudWidget.load(song.soundcloud_url, {
        auto_play: true,
        color: '777',
        hide_related: false,
        show_reposts: false
      });

      ga('send', 'event', song.page_title, 'click', 'play song');

      if (update_index) songIndex = $scope.songs.indexOf(song);
    };
  });