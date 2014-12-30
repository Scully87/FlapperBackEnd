var app = angular.module('flapperNews', ['ui.router'])

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {
//resolve ensures that any time home is entered, we always load all of the posts
//before the state finishes loading.
  $stateProvider
    .state('home', {
        url: '/home',
        templateUrl: '/home.html',
        controller: 'MainCtrl',
        resolve: {
            postPromise: ['posts', function (posts) {
                return posts.getAll();
            }]
        }
    })
    .state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
            post: ['$stateParams', 'posts', function ($stateParams, posts) {
                return posts.get($stateParams.id);
            }]
        }
    });
  $urlRouterProvider.otherwise('home');
}])

app.factory('posts', ['$http', function ($http){
    var o = {
        posts: []
    };

    o.getAll = function() {
        return $http.get('/posts').success(function (data) {
            angular.copy(data, o.posts);
        });
    };
        //now we'll need to create new posts
    o.create = function(post) {
        return $http.post('/posts', post).success(function (data) {
            o.posts.push(data);
        });
    };
    o.upvote = function(post) {
        return $http.put('/posts/' + post._id + '/upvote')
        .success(function(data){
            post.votes += 1;
        });
    };
    o.downvote = function(post) {
        return $http.put('/posts/' + post._id + '/downvote')
        .success(function(data){
            post.votes -= 1;
        });
    };    
    o.get = function(id) {
        return $http.get('/posts/' + id).then(function(res){
          return res.data;
        });
    };
    o.delete = function(post) {
          Post.delete(post)
          _.remove($scope.posts, post)
        }
    o.addComment = function(id, comment) {
        return $http.post('/posts/' + id + '/comments', comment);
    };
    o.upvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
            .success(function(data){
                comment.votes += 1;
            });
    };
    o.downvoteComment = function(post, comment) {
        return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/downvote')
            .success(function(data){
                comment.votes += 1;
            });
    };      
    return o;
}])


app.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
    
    $scope.posts = posts.posts;
    //setting title to blank here to prevent empty posts
    $scope.title = '';
    
    $scope.addPost = function(){
        if($scope.title === '') {return;}
        posts.create({
            title: $scope.title,
            link: $scope.link,
        });
        //clear the values
        $scope.title = '';
        $scope.link = '';
        
    };
    
    $scope.upvote = function(post) {
        posts.upvote(post);
    }

    $scope.downvote = function(post) {
        posts.downvote(post);
    }   

}])

app.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function ($scope, posts, post){
    $scope.post = post;

    $scope.addComment = function () {
        if ($scope.body === '') { return; }
        posts.addComment(post._id, {
            body: $scope.body,
            author: 'user',
        }).success(function (comment) {
            $scope.post.comments.push(comment);
        });
        $scope.body = '';
    };
    $scope.upvote = function(comment){
        posts.upvoteComment(post, comment);
    };
    $scope.downvote = function(comment){
        posts.downvoteComment(post, comment);
    };
}]);