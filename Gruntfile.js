var babelify = require('babelify')

module.exports = function(grunt) {
    require('time-grunt')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                compress: {
                    dead_code: true,
                    drop_debugger: true,
                    drop_console: true,
                    unused: true
                }
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>.min.js'
            }
        },

        jasmine: {
            pivotal: {
                src: './dist/noisy.js',
                options: {
                    specs: './dist/noisy.spec.js'
                }
            },
            coverage: {
                src: ['./dist/noisy.js'],
                options: {
                    specs: ['./dist/noisy.spec.js'],
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'bin/coverage/coverage.json',
                        report: 'bin/coverage',
                        thresholds: {
                            lines: 75,
                            statements: 75,
                            branches: 75,
                            functions: 90
                        }
                    }
                }
            }
        },
        eslint: {
            options: {
                configFile: '.eslintrc'
            },
            validate: ['src/**/*.js']
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'releasing v%VERSION%',
                commitFiles: ['-a'],
                createTag: true,
                tagName: 'v%VERSION%',
                tagMessage: 'version %VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
                globalReplace: false,
                prereleaseName: false,
                regExp: false
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    // conventional-changelog options go here
                    preset: 'angular'
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        },
        browserify: {

            dist: {
                options: {
                    transform: [
                        ["babelify", {
                            loose: "all"
                        }]
                    ]
                },
                files: {
                    "./dist/noisy.js": ["./src/index.js"],
                    "./dist/noisy.spec.js": ["./spec/**/*.spec.js"]
                }
            }
        },
        budo: {
            options: {
                debug: true,
                live: true,
                port: 8080, // use this port
            },
            src: ['dist/noisy.js']
        },
        watch: {
            files: ['<%= eslint.validate %>', './spec/**/*.spec.js', 'src/css/style.css'],
            tasks: ['watcher']
        },
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: ['dist', 'assets'],
                    keepalive: true
                }
            }
        },
        concurrent: {
            target: {
                tasks: ['run', 'serve'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        autoprefixer: {
            dist: {
                options: {
                    browsers: ['last 1 version', '> 1%', 'ie 8']
                },
                files: {
                    'dist/noisy-prefixed.css': ['src/css/style.css']
                }
            }
        },

        // Minify CSS
        cssmin: {
            combine: {
                files: {
                    'dist/noisy.min.css': ['dist/noisy-prefixed.css']
                },
            },
        },
    });
    // Default task(s).
    grunt.registerTask('dev', [], function() {
        grunt.loadNpmTasks('grunt-concurrent');
        grunt.task.run('concurrent');
    });
    grunt.registerTask('watcher', [], function() {
        grunt.loadNpmTasks('grunt-eslint');
        grunt.loadNpmTasks('grunt-browserify');
        grunt.loadNpmTasks('grunt-contrib-jasmine');
        grunt.task.run(
            'css',
            'eslint',
            'browserify'
            //'jasmine:pivotal'
        );
    });
    grunt.registerTask('serve', [], function() {
        grunt.loadNpmTasks('grunt-contrib-connect');
        grunt.task.run(
            'connect'
        );
    });
    grunt.registerTask('test', [], function() {
        grunt.loadNpmTasks('grunt-eslint');
        grunt.loadNpmTasks('grunt-browserify');
        grunt.loadNpmTasks('grunt-contrib-jasmine');
        grunt.task.run(
            'eslint',
            'browserify',
            'jasmine'
        );
    });
    grunt.registerTask('run', [], function() {
        grunt.loadNpmTasks('grunt-contrib-watch');
        grunt.task.run('watch');
    });
    grunt.registerTask('default', [], function() {
        grunt.loadNpmTasks('grunt-eslint');
        grunt.loadNpmTasks('grunt-browserify');
        grunt.loadNpmTasks('grunt-contrib-jasmine');
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.task.run(
            'css',
            'eslint',
            'browserify',
            'jasmine:pivotal',
            'uglify'
        );
    });
    grunt.registerTask('css', [], function() {
        grunt.loadNpmTasks('grunt-autoprefixer');
        grunt.loadNpmTasks('grunt-contrib-cssmin');
        grunt.task.run(
            'autoprefixer',
            'cssmin'
        )
    });
    grunt.registerTask('changelog', [], function() {
        grunt.loadNpmTasks('grunt-conventional-changelog');
        grunt.task.run('conventionalChangelog');
    });
    grunt.registerTask('release', [], function() {
        grunt.loadNpmTasks('grunt-bump');
        grunt.loadNpmTasks('grunt-conventional-changelog');
        grunt.task.run('default', 'bump-only', 'conventionalChangelog', 'bump-commit');
    });
};
