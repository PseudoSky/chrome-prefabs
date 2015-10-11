# Chrome Prefabs
### Browser navigation with organization based on domain prefixes.

### Note
I built this from a chrome extension I hacked. Because of the license in the original version, I don't think I can publicly distribute the code. If I misunderstood the contract, or you would like to see the code, let me know.


## Purpose

I, like many others always have hundreds of tabs open. When you have this many tabs open all the time, it becomes impossible to get back to the right one. Often, one has multiple of the same page open on accident, or even different pages within the same domain. IE: Gmail for one message, gmail for another message / separate tabs at different locations in the page.

Windows, Linux and Osx all have native support for cascading applications into dock icons. So why not add that feature to the browser?

## Vision

My ideal vision for this is that the only tabs that appear in a browser are distinct second-level domain names (google.com, facebook.com, github.com). From there, just like in your dock, you would click the tab and a dropdown would open with the different pages.

## Prototype

This prototype is something I mocked up to test this navigation technique. I literally wrote it in less than an hour with no previous knowlege of chrome extensions (this is why it doesn't look too pretty).

The way I got it up so quickly was I found another extension that aggregated the tabs, and I utilized its backend. I stripped the front end out, and placed simple hrefs to get to the tabs.

The original extension is here
http://blog.visibotech.com/p/toomanytabs-for-chrome.html

This version contains little to none of the functional purpose of the original



Here are some screenshots


![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot1.png)
![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot2.png)
![](https://github.com/PseudoSky/chrome-prefabs/blob/master/preview/shot3.png)