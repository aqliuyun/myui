module.exports = function (grunt) {  
  grunt.initConfig(
  {
    concat: {//文件合并  
      css: {
        src: ['css/*.css'],
        dest: 'dist/myui.css'
      },
      js:{
        src: ['js/myui.libs.js','js/*.js'],
        dest: 'dist/myui.js'
      }
    },  
    cssmin: { //css文件压缩  
      css: {  
        src: 'dist/myui.css',
        dest: 'dist/myui.min.css'
      }    
    },
    uglify:{
      buildall:{
        options:{
          report: "min"//输出压缩率，可选的值有 false(不输出信息)，gzip
        },
        files:[{
          mangle:'true',
          preserveComments: 'false',
          src:'dist/myui.js',
          dest:'dist/myui.min.js'
        }]
      }
    }
  }); 
  grunt.loadNpmTasks('grunt-css');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.registerTask('default', ['concat','cssmin','uglify:buildall']);
}  