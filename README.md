
# OTTPLAYER channel grouping for ilookTv playlist

Provided script works with Chrome extension: Tampermonkey


## FAQ

#### What's the purpose of this script?

It allows to assign group without visiting each channel settings page.

#### Can it work with all playlist.m3u8 files?

Tested only with structure which provided by ilookTv

#### Exact page where this script will run?

Works in ottplayer.tv/playlist/edit/******


## Example how to use

1: Copy all playlist.m3u8 content (will be used to determine channel url)

```bash
  #EXTM3U
  #EXTINF:0 tvg-rec="0",Channel title
  #EXTGRP:news
  http://channel.web/iptv/******/123/index.m3u8
```

2: Open Ottplayer playlist settings and paste into textarea content 

![Ottplayer settings page](https://i.imgur.com/gmKwX38.png)

3: Click 'Scan playlist' and 'Channel' which appeared after first click

4: Choose left side section where exist ungrouped channels. And wait until grouping buttons appear

5: After clicking them, channel will be assigned to selected group
![Ottplayer channel group](https://i.imgur.com/4e9PaDc.png)