# Autoexec(.bat)

No, of course not autoexec.bat, but a small app, that helps you, as developer, to automatically execute commands on file change.

## Why one more app?

Yeah, there are some apps, that doing nearly the same, but... only nearly. With every app, I had problems, missing features, much too complicated, etc.. So I started to write my own one. Here it is.

## How to use?

Easy! Just install autoexec global:
`npm install -g autoexec`

or local:
`npm install autoexec`

create your config (see below)

and run:
`autoexec`

## CLI options:
```
Usage: autoexec [options]

Options:
   -c, --config    JSON config file  [autoexec.json]
   -p, --path      working directory  [.]
   -v, --version   print version and exit
```

## Config:
Sample config:
```
{
    "config": [
        {
            "name": "Templates",
            "path": [
                "templates"
            ],
            "files": [
                "**/*.tpl"
            ],
            "exec": "make templates",
            "blocking": true
        },
        {
            "name": "JavaScript",
            "path": [
                "src",
                "foo/bar/"
            ],
            "files": "**/*.js",
            "exec": "make js",
            "blocking": true
        },
        {
            "name": "Images / CSS",
            "path": [
                "css",
                "images"
            ],
            "files": [
                "**/*.scss",
                "**/*.png",
                "**/*.jpg",
                "**/*.gif"
            ],
            "exec": "make images css"
        }
    ]
}
```

Every array element of "config" has the following possible options:  
- `name`: This name is displayed in the log and in the notify  
- `path`: String or array of strings of the directories to be watched, based on the working directory  
- `files`: String or array of strings which files should be watches, syntax see [anymatch](https://github.com/es128/anymatch)  
- `ignored` (optional): String or array of strings which files should be watches, syntax see [anymatch](https://github.com/es128/anymatch)  
- `exec`: Command to execute  
- `blocking` (optional): default is `false`. If the value is `true` autoexec will only run one of the blocking entries at the same time. E.g. in the above example, if templates is running, javascript wait until templates is done.
