// ==UserScript==
// @name         Ottplayer channels grouping
// @namespace    https://ottplayer.tv/playlist/edit/
// @version      1.0
// @author       pastuh
// @match        https://ottplayer.tv/playlist/edit/*
// @icon         https://www.google.com/s2/favicons?domain=ottplayer.tv
// @grant        GM_addStyle
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.19.7/URI.min.js
// ==/UserScript==

(function() {
    'use strict';

    GM_addStyle(`
    .ott-editor {
       display: flex;
       flex-wrap: wrap;
    }
    .ott-adjust {
       background: red !important;
       color: white;
       margin: 1px;
       border: 1px solid white;
       cursor: pointer;
    }
    .ott-adjust:hover {
       background: white;
       color: black;
    }
    `);

    let savedGroups = [];
    let savedPlaylist = [];

    let channelButton = $("form a[href='#pl_channels']").first();
    channelButton.css({'visibility':'hidden'});

    let btnTemplate = `<span id="ott-save-playlist" style="float:right;" class="uk-button uk-button-default uk-button-large uk-float-left uk-box-shadow-small" type="submit">Scan playlist</span>`;
    $('#playlistSet').append(btnTemplate);
    let areaTemplate = `<textarea id="ott-user-playlist" rows="4" cols="50"></textarea>`;
    $('#playlistSet').append(areaTemplate);


    $('#ott-save-playlist').on('click', function() {
        savePlaylistData();
        channelButton.css({'visibility':'visible'});
        channelButton.css({'background':'orange'});
        $('#ott-user-playlist').css({'visibility':'hidden'});
        $('#ott-save-playlist').css({'visibility':'hidden'});
    });

    function savePlaylistData() {
        let data = $('#ott-user-playlist').val();
        let splitData = data.split('\n');

        for(let i = 0;i<splitData.length;i++){

            if(splitData[i].includes('EXTINF')) {
                let playlistTitle = splitData[i].substr(splitData[i].indexOf(',')+1);
                let targetTitle = playlistTitle.replace(/[\]{}()*+?.\\^$|#]/g, '\\$&');

                savedPlaylist.push({
                    'title': targetTitle,
                    'url': splitData[i+2]
                });
            }
        }
    }

    channelButton.on('click', function() {
        let intervalChecker = setInterval(function() {
            let groupList = $('.gr_sort li');
            if(groupList.length) {
                clearInterval(intervalChecker);
                getGroups();
                addGroupButtons();
            }

        }, 100);
    });

    function getGroups() {
        let groups = $('#gr_box li.drop_inn');
        groups.each(function() {
            let temp_title = $(this).find('a.no_transform').contents().get(0).nodeValue;
            let title = temp_title.trim();

            let temp_id = $(this).attr("data-target");
            let id = temp_id.match(/\d+/)[0];

            savedGroups.push({
                title,
                id
            });
        });

        //console.log(savedGroups);
    }

    function addGroupButtons() {

        $('.sub_block_list .uk-active .channel_item.addch.ui-sortable-handle').append(`<span class="ott-loading uk-button uk-button-default uk-button-small" style="background:#edfbf6">LOADING</span>`);

        let intervalChecker = setInterval(function() {

            let channelsList = $('.sub_block_list .uk-active .channel_item.list_bar');
            if(channelsList.length) {
                clearInterval(intervalChecker);

                // If edit buttons not exist, add them
                if(!channelsList.find('.ott-editor').length) {

                    const url = window.location.href;
                    const playlist_id = url.substring(url.lastIndexOf('/') + 1);

                    channelsList.each(function() {

                        const temp_channel_id = $(this).find('img').attr("data-src");
                        if (typeof temp_channel_id !== 'undefined') {

                            let temp_channel_title = $(this).text().trim();
                            let channel_title = temp_channel_title.replace(/[\]{}()*+?.\\^$|#]/g, '\\$&');

                            const channel_id = temp_channel_id.match(/\/(\d+)\.png/)[1];
                            const channel_request = $(this).attr("id");
                            let channel_url;

                            for(let i=0;i<savedPlaylist.length;i++) {
                                if(savedPlaylist[i].title == channel_title) {
                                    channel_url = savedPlaylist[i].url;
                                    break;
                                }
                            }

                            let elementTemplate = `<div class="ott-editor"></div>`;
                            $(this).find('.uk-iconnav').after(elementTemplate);

                            savedGroups.forEach((group) => {
                                let buttonTemplate = `<span data-playlist="${playlist_id}" data-group="${group.id}" data-title="${temp_channel_title}" data-channel="${channel_id}" data-url="${channel_url}" data-req="${channel_request}" class="ott-adjust uk-float-right">${group.title}</span>`;
                                $(this).find('.ott-editor').append(buttonTemplate);
                            });

                        };

                    });

                    activateGroupButtons();

                }

                $('.ott-loading').text('LOADED');
                setTimeout(function() {
                    $('.ott-loading').remove();
                }, 1000);

            }
        }, 100);
    }

    function activateGroupButtons() {

        let groupEditButton = $('.sub_block_list .uk-active .channel_item.list_bar .ott-adjust');

        groupEditButton.each(function() {

            $(this).on('click', function() {

                let element = $(this).parent().closest('li');
                element.css({'background':'#0e9d00'});

                let playlist_id = $(this).attr("data-playlist");
                let group_id = $(this).attr("data-group");
                let channel_title = $(this).attr("data-title");
                let channel_id = $(this).attr("data-channel");
                let channel_url = $(this).attr("data-url");
                let channel_req = $(this).attr("data-req");

                setChannelGroup(playlist_id, group_id, channel_title, channel_id, channel_url, channel_req, element);

                //After group is set, hide other list buttons
                $(this).parent().css({'visibility': 'hidden'});
            });

        });

    }

    function setChannelGroup(playlist_id, group_id, channel_title, channel_id, channel_url, channel_req, element){

        let formParams = {
            playlist_id: playlist_id,
            group_id: group_id,
            ch_title: channel_title,
            href: channel_url,
            icon: "0",
            libchannel_id: channel_id,
            user_icon: "",
            u_icon: "0",
            adult: "0"
        };

        let http = new XMLHttpRequest();

        let requestURL = URI(`https://ottplayer.tv/channel/edit/${channel_req}/${playlist_id}`);
        http.open("POST", requestURL.toString(), true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");

        //Call a function when the state changes.
        http.onreadystatechange = function() {
            element.css({'background':'#12cc00'});
        };

        requestURL.addSearch(formParams);
        http.send(requestURL.query());

        //console.log(`Post send`, formParams);

    }


    $('body').on('click', '.gr_sort li', function() {

        let intervalChecker = setInterval(function() {

            let channelsList = $('.sub_block_list .uk-active .channel_item.list_bar');
            if(channelsList.length) {
                clearInterval(intervalChecker);
                addGroupButtons();
            }

        }, 100);

    });

})();