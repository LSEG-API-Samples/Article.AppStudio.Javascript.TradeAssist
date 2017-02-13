module.exports = function (grunt) {
	var path = require('path');
	require('load-grunt-tasks')(grunt);
	require('time-grunt')(grunt);
	grunt.initConfig({
		toolkitver: "1.0.9.1",

		project_path: __dirname,

		dist_dir: path.resolve() + '\\dist',
		temp_dir: path.resolve()  + '\\tmp',

		web_dir: '',
		server_dir: 'App',

		app: grunt.file.readJSON('app.json'),
		

		copy: {
			dev: {
				files: [{   
						expand:true, 
						src:['**/*', '!*', '!node_modules/**', 'index.html', 'app.json', 'trapp.js','favicon.ico'], 
						dest: '<%= dist_dir %>'
					}
				]
			},
			dist: {
				files: [{   
						expand:true, 
						src:['index.html', 'app.json', 'web/components/clients/clients.tpl.html', 
						'web/components/calculator/calculator.html', 'web/components/calculator/aoz-quote.html', 'web/components/calculator/aoz-scoreboard.html'], 
						dest: '<%= dist_dir %>'
					},

					{
						expand:true, 
						cwd: 'web/webui/',
						src:[
						'fonts/**', 'images/**'], 
						dest: '<%= dist_dir %>/web'                      
					},
					{
						expand:true, 
						cwd: 'web/font-awesome-4.3.0/',
						src:[
						'fonts/**'], 
						dest: '<%= dist_dir %>/web'                      
					}                    
				]
			}
		}, 
		concat: {
			js: {
				src: [
				  'web/libs/jet-1.8.0/JET.js',
				  'web/libs/jet-1.8.0/plugins/Quotes.js',
				  'web/libs/jet-1.8.0/plugins/Settings.js',
				  'web/libs/jquery/jquery-2.1.4.min.js',
				  'web/libs/select2/select2.min.js',
				  'web/libs/angular/angular.min.js',
				  'web/libs/angular/i18n/angular-locale_ru-ru.js',
				  'web/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
				  'web/libs/angular-route/angular-route.js',
				  'web/libs/angular-xeditable/dist/js/xeditable.js',
				  'web/libs/js/tr.autosuggest.min.js',
				  'trapp.js',
				  'web/components/calculator/calculator.js',
				  'web/components/quotes/quotes.js',
				  'web/components/clients/clients.js',
				  'web/components/utils/utils.js',
				  'web/components/utils/select2_ang.js'
				],
				dest:'<%= temp_dir %>/trapp.js'
			},
			css: {
				src: [
				  'web/css/normalize.css',
				  'web/css/main.css',
				  'web/libs/angular-xeditable/dist/css/xeditable.css',
				  'web/webui/css/EikonWebUI.css',
				  'web/css/tr.autosuggest.css',
				  'web/css/app.css',
				  'web/css/tra.css'
				],
				dest:'<%= temp_dir %>/web/css/appstyles.css'
			}
		},      
		
		uglify: {
			dist: {
				files: {
					'<%= dist_dir %>/trapp.js': ['<%= temp_dir %>/trapp.js']
				}
			}
		},   

		cssmin: {
			dist: {
				files: {
					'<%= dist_dir %>/web/css/appstyles.css': ['<%= temp_dir %>/web/css/appstyles.css']
				}
			}
		},

		clean: {
			options: { force: true },
			dist: {src: ['<%= dist_dir %>/**', '!<%= dist_dir %>']},
			temp: {src: ['<%= temp_dir %>/**', '!<%= temp_dir %>']}
		}, 

		targethtml: {
			dev: {
				files: {
					'<%= dist_dir %>/index.html': 'index.html'
				}
			},
			dist: {
				files: {
					'<%= dist_dir %>/index.html': 'index.html',
				}
			}
		}
	}); 

	grunt.registerTask('make', ['clean:dist', 'copy:dev']);
	grunt.registerTask('del', ['clean:dist']);
	
};