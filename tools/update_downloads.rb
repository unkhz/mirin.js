# require
require 'rubygems'
require 'github_api'

# setup
@login = `git config github.user`.chomp  # your login for github
@token = `git config github.token`.chomp # your token for github
@repos = 'mirin.js'               # your repos name (like 'taberareloo')
@github = Github.new oauth_token: @token
@now = Time.now
@nowf = @now.strftime("%Y%m%d")

@files = Hash[
  "min" => Hash[
    "name" => 'mirin.min.' + @nowf + '.js.gz',
    "description" => 'Minified production version of master build ' + @now.to_s,
    "file" => File.join('dist', 'mirin.min.js.gz')
  ],
  "debug" => Hash[
    "name" => 'mirin.debug.' + @nowf +' .js.gz',
    "description" => 'Unminified debug version of master build ' + @now.to_s,
    "file" => File.join('dist', 'mirin.debug.js.gz')
  ]
]

# delete existing downloads
@github.repos.downloads.list @login, @repos do |el|
  found = @files.select { |f| f['name'] == el.name }
  if found.length > 0
    response = @github.repos.downloads.delete @login, @repos, el.id
  end
end

# add new downloads
@files.each do |key, f|
  response = @github.repos.downloads.create @login, @repos, name: f['name'], size: File.size(f['file']), description: f['description']
  @github.repos.downloads.upload response, f['file']
end
