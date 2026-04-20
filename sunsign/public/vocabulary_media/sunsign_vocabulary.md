# SunSign Model Vocabulary

Here is the complete list of vocabulary that your SunSign application currently knows natively, along with visual examples straight from your dataset!

## 1. Dynamic Words & Phrases (LSTM Model)

These require a sequence of motions (about 1 second / 30 frames) to be recognized. Feel free to interact with the demo.

| Phrase / Word | Type | Demo |
|---------------|------|------|
| Alhamdulillah | Word/Action | ![Alhamdulillah](./Alhamdulillah.gif) |
| baby | Word/Action | ![baby](./baby.gif) |
| eat | Word/Action | ![eat](./eat.gif) |
| father | Word/Action | ![father](./father.gif) |
| finish | Word/Action | ![finish](./finish.gif) |
| good | Word/Action | ![good](./good.gif) |
| Good bye | Word/Action | ![Good bye](./Good_bye.gif) |
| Good evening | Word/Action | ![Good evening](./Good_evening.gif) |
| Good morning | Word/Action | ![Good morning](./Good_morning.gif) |
| haa | Word/Action | ![haa](./haa.JPG) |
| happy | Word/Action | ![happy](./happy.gif) |
| hear | Word/Action | ![hear](./hear.gif) |
| house | Word/Action | ![house](./house.gif) |
| How are you | Word/Action | ![How are you](./How_are_you.gif) |
| I am fine | Word/Action | ![I am fine](./I_am_fine.gif) |
| I am pleased to meet you | Word/Action | ![I am pleased to meet you](./I_am_pleased_to_meet_you.gif) |
| I am sorry | Word/Action | ![I am sorry](./I_am_sorry.gif) |
| important | Word/Action | ![important](./important.gif) |
| kaaf | Word/Action | ![kaaf](./kaaf.JPG) |
| laam | Word/Action | ![laam](./laam.JPG) |
| love | Word/Action | ![love](./love.gif) |
| mall | Word/Action | ![mall](./mall.gif) |
| me | Word/Action | ![me](./me.gif) |
| mosque | Word/Action | ![mosque](./mosque.gif) |
| mother | Word/Action | ![mother](./mother.gif) |
| normal | Word/Action | ![normal](./normal.gif) |
| Not bad | Word/Action | ![Not bad](./Not_bad.gif) |
| sad | Word/Action | ![sad](./sad.gif) |
| Salam aleikum | Word/Action | ![Salam aleikum](./Salam_aleikum.gif) |
| Sorry | Word/Action | ![Sorry](./Sorry.gif) |
| stop | Word/Action | ![stop](./stop.gif) |
| ta | Word/Action | ![ta](./ta.JPG) |
| thal | Word/Action | ![thal](./thal.JPG) |
| thanks | Word/Action | ![thanks](./thanks.gif) |
| Thanks | Word/Action | ![Thanks](./Thanks.gif) |
| thinking | Word/Action | ![thinking](./thinking.gif) |
| worry | Word/Action | ![worry](./worry.gif) |
| yaa | Word/Action | ![yaa](./yaa.JPG) |
| zay | Word/Action | ![zay](./zay.JPG) |

*Note: The system supports additional words (218 total) that currently lack visual demo materials in this document.*

## 2. Static Arabic Letters (CNN Model)

These are recognized from a single static frame of the hand. Hold the shape in front of the camera for 1.5 seconds to commit the letter to the text box.

| Arabic Letter | Transliteration (Name) | Demo |
|---------------|------------------------|------|
| أ | aleff | ![aleff](./aleff.JPG) |
| ب | bb | ![bb](./bb.JPG) |
| ت | taa | ![taa](./taa.JPG) |
| ث | thaa | ![thaa](./thaa.JPG) |
| ج | jeem | ![jeem](./jeem.JPG) |
| ح | haa | ![haa](./haa.JPG) |
| خ | khaa | ![khaa](./khaa.JPG) |
| د | dal | ![dal](./dal.JPG) |
| ذ | thal | ![thal](./thal.JPG) |
| ر | ra | ![ra](./ra.JPG) |
| ز | zay | ![zay](./zay.JPG) |
| س | seen | ![seen](./seen.JPG) |
| ش | sheen | ![sheen](./sheen.JPG) |
| ص | saad | ![saad](./saad.JPG) |
| ض | dhad | ![dhad](./dhad.JPG) |
| ط | ta | ![ta](./ta.JPG) |
| ظ | dha | ![dha](./dha.JPG) |
| ع | ain | ![ain](./ain.JPG) |
| غ | ghain | ![ghain](./ghain.JPG) |
| ف | fa | ![fa](./fa.JPG) |
| ق | gaaf | ![gaaf](./gaaf.JPG) |
| ك | kaaf | ![kaaf](./kaaf.JPG) |
| ل | laam | ![laam](./laam.JPG) |
| م | meem | ![meem](./meem.JPG) |
| ن | nun | ![nun](./nun.JPG) |
| ه | ha | ![ha](./ha.JPG) |
| و | waw | ![waw](./waw.JPG) |
| ي | ya | ![ya](./ya.JPG) |
| ى | yaa | ![yaa](./yaa.JPG) |
| ة | toot | ![toot](./toot.JPG) |
| ال | al | ![al](./al.JPG) |
| لا | la | ![la](./la.JPG) |

> [!TIP]
> **How to Test**
> Open the app and form the shape of a static letter (e.g., "ب"). The UI will begin a 1.5-second loading ring. Before the ring completes, perform a dynamic motion from the LSTM list (like the sign for "eat"). The system will cancel the letter and immediately write "eat" to your sentence!
