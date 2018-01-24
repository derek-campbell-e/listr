module.exports = function (grunt){
  const path = require('path');
  const pkg = grunt.file.readJSON('package.json');
  
  grunt.initConfig({
    /**
     * Package json variable
     * @description Access values from package.json
     */

     pkg: pkg,

     config: pkg.grunt,

    /**
     * Grunt Tasks
     * @description Config each task with options and targets
     */

     // CSS / SCSS

     sass: {
       development: {
         options: {
           style: 'expanded',
           sourcemap: 'none'
         },
         files: [{
          expand: true,
          cwd: "<%= config.scss %>",
          src: ['<%= config.development %>.scss'],
          dest: "<%= config.css %>",
          ext: ".css"
         }]
       },
       production: {
         options: {
           style: 'compressed',
           sourcemap: 'none'
         },
         files: [{
          expand: true,
          cwd: "<%= config.scss %>",
          src: ['<%= config.production %>.scss'],
          dest: "<%= config.css %>",
          ext: ".css"
         }]
       },
     },

     bless: {
       production: {
         files: [{
          expand: true,
          cwd: "<%= config.css %>",
          src: ['<%= config.production %>.css'],
          dest: path.join("<%= config.css %>", "<%= config.bless %>"),
          ext: ".css"
         }]
       }
     },

     // JS

     jshint: {
       all: {
         options: {
           '-W043': true,
           '-W004': true,
           '-W083': true,
         },
         src: [path.join("<%= config.js %>", "<%= config.development %>", "**/*.js")]
       },
       globals: {
         jQuery: true
       }
     },

     concat: {
       options: {
         process: function(src, filepath) {
         return '/*! -------------------- ' + filepath + ' -------------------- */\n' + src ;
       	},
       	stripBanners: true
       },
       dist: {
         src: [path.join("<%= config.js %>", "<%= config.development %>", "**/*.js")],
         dest: path.join("<%= config.js %>", "<%= config.production %>", "<%= config.production %>.js"),
       },
     },

     uglify: {
       options: {
         //banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
         //'<%= grunt.template.today("yyyy-mm-dd") %> */',
         banner:
         "/**\n" +
         " * @author <%= pkg.author %>\n" +
         " * @copyright <%= pkg.company %> <%= grunt.template.today('yyyy') %>. All rights reserved.\n" +
         " */\n",
         ie8: true,
       },

       production: {
         src: path.join("<%= config.js %>", "<%= config.production %>", "<%= config.production %>.js"),
         dest: path.join("<%= config.js %>", "<%= config.production %>", "<%= config.production %>.min.js")
       }
     },



     watch: {
       development: {
         files: [path.join("js", "<%= config.development %>", "**/*.js"), path.join("<%= config.scss %>", "<%= config.development %>.scss")],
         tasks: ['development'],
       },
       production: {
         files: [path.join("js", "<%= config.production %>", "**/*.js"), path.join("<%= config.scss %>", "<%= config.production %>.scss")],
         tasks: ['production'],
       }
     },

   });

   grunt.loadNpmTasks('grunt-sass');
   grunt.loadNpmTasks('grunt-contrib-watch');
 
   grunt.registerTask(
     'development',
     "Run to develop and test the script/website",
     ['sass:development', 'watch:development']
   );

   grunt.registerTask(
     'production',
     "Run to build assets / dependencies for production",
     ['sass:production', 'bless:production', 'jshint', 'concat', 'uglify', 'watch:production']
   );

};