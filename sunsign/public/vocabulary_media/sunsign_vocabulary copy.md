# SunSign Model Vocabulary

Here is the complete list of vocabulary that your SunSign application currently knows natively, along with visual examples straight from your dataset!

> [!TIP]
> **How to Test**
> Open the app and form the shape of a static letter (e.g., "ب"). The UI will begin a 1.5-second loading ring. Before the ring completes, perform a dynamic motion from the LSTM list (like the sign for "eat"). The system will cancel the letter and immediately write "eat" to your sentence!

## 1. Static Arabic Letters (CNN Model)

These are recognized from a single static frame of the hand. Hold the shape in front of the camera for 1.5 seconds to commit the letter to the text box.

| Arabic | English | Demo |
|--------|---------|------|
| أ | aleff | <div align="center"><img src="./aleff.JPG" width="300"/><br/>aleff</div> |
| ب | bb | <div align="center"><img src="./bb.JPG" width="300"/><br/>bb</div> |
| ت | taa | <div align="center"><img src="./taa.JPG" width="300"/><br/>taa</div> |
| ث | thaa | <div align="center"><img src="./thaa.JPG" width="300"/><br/>thaa</div> |
| ج | jeem | <div align="center"><img src="./jeem.JPG" width="300"/><br/>jeem</div> |
| ح | haa | <div align="center"><img src="./haa.JPG" width="300"/><br/>haa</div> |
| خ | khaa | <div align="center"><img src="./khaa.JPG" width="300"/><br/>khaa</div> |
| د | dal | <div align="center"><img src="./dal.JPG" width="300"/><br/>dal</div> |
| ذ | thal | <div align="center"><img src="./thal.JPG" width="300"/><br/>thal</div> |
| ر | ra | <div align="center"><img src="./ra.JPG" width="300"/><br/>ra</div> |
| ز | zay | <div align="center"><img src="./zay.JPG" width="300"/><br/>zay</div> |
| س | seen | <div align="center"><img src="./seen.JPG" width="300"/><br/>seen</div> |
| ش | sheen | <div align="center"><img src="./sheen.JPG" width="300"/><br/>sheen</div> |
| ص | saad | <div align="center"><img src="./saad.JPG" width="300"/><br/>saad</div> |
| ض | dhad | <div align="center"><img src="./dhad.JPG" width="300"/><br/>dhad</div> |
| ط | ta | <div align="center"><img src="./ta.JPG" width="300"/><br/>ta</div> |
| ظ | dha | <div align="center"><img src="./dha.JPG" width="300"/><br/>dha</div> |
| ع | ain | <div align="center"><img src="./ain.JPG" width="300"/><br/>ain</div> |
| غ | ghain | <div align="center"><img src="./ghain.JPG" width="300"/><br/>ghain</div> |
| ف | fa | <div align="center"><img src="./fa.JPG" width="300"/><br/>fa</div> |
| ق | gaaf | <div align="center"><img src="./gaaf.JPG" width="300"/><br/>gaaf</div> |
| ك | kaaf | <div align="center"><img src="./kaaf.JPG" width="300"/><br/>kaaf</div> |
| ل | laam | <div align="center"><img src="./laam.JPG" width="300"/><br/>laam</div> |
| م | meem | <div align="center"><img src="./meem.JPG" width="300"/><br/>meem</div> |
| ن | nun | <div align="center"><img src="./nun.JPG" width="300"/><br/>nun</div> |
| ه | ha | <div align="center"><img src="./ha.JPG" width="300"/><br/>ha</div> |
| و | waw | <div align="center"><img src="./waw.JPG" width="300"/><br/>waw</div> |
| ي | ya | <div align="center"><img src="./ya.JPG" width="300"/><br/>ya</div> |
| ى | yaa | <div align="center"><img src="./yaa.JPG" width="300"/><br/>yaa</div> |
| ة | toot | <div align="center"><img src="./toot.JPG" width="300"/><br/>toot</div> |
| ال | al | <div align="center"><img src="./al.JPG" width="300"/><br/>al</div> |
| لا | la | <div align="center"><img src="./la.JPG" width="300"/><br/>la</div> |


## 2. Dynamic Words & Phrases (LSTM Model)

These require a sequence of motions (about 1 second / 30 frames) to be recognized. Feel free to interact with the demo.

| Arabic | English | Demo |
|--------|---------|------|
| ٠ | number_0 | <div align="center"><img src="./0.gif" width="300"/><br/>number_0</div> |
| ١ | number_1 | <div align="center"><img src="./1.gif" width="300"/><br/>number_1</div> |
| ١٬٠٠٠٬٠٠٠ | number_1000000 | <div align="center"><img src="./1000000.gif" width="300"/><br/>number_1000000</div> |
| ١٠ | number_10 | <div align="center"><img src="./10.gif" width="300"/><br/>number_10</div> |
| ١٠٬٠٠٠٬٠٠٠ | number_10000000 | <div align="center"><img src="./10000000.gif" width="300"/><br/>number_10000000</div> |
| ١٠٠ | number_100 | <div align="center"><img src="./100.gif" width="300"/><br/>number_100</div> |
| ١٠٠٠ | number_1000 | <div align="center"><img src="./1000.gif" width="300"/><br/>number_1000</div> |
| ٢ | number_2 | <div align="center"><img src="./2.gif" width="300"/><br/>number_2</div> |
| ٢٠ | number_20 | <div align="center"><img src="./20.gif" width="300"/><br/>number_20</div> |
| ٢٠٠ | number_200 | <div align="center"><img src="./200.gif" width="300"/><br/>number_200</div> |
| ٣ | number_3 | <div align="center"><img src="./3.gif" width="300"/><br/>number_3</div> |
| ٣٠ | number_30 | <div align="center"><img src="./30.gif" width="300"/><br/>number_30</div> |
| ٣٠٠ | number_300 | <div align="center"><img src="./300.gif" width="300"/><br/>number_300</div> |
| ٤ | number_4 | <div align="center"><img src="./4.gif" width="300"/><br/>number_4</div> |
| ٤٠ | number_40 | <div align="center"><img src="./40.gif" width="300"/><br/>number_40</div> |
| ٤٠٠ | number_400 | <div align="center"><img src="./400.gif" width="300"/><br/>number_400</div> |
| ٥ | number_5 | <div align="center"><img src="./5.gif" width="300"/><br/>number_5</div> |
| ٥٠ | number_50 | <div align="center"><img src="./50.gif" width="300"/><br/>number_50</div> |
| ٥٠٠ | number_500 | <div align="center"><img src="./500.gif" width="300"/><br/>number_500</div> |
| ٦ | number_6 | <div align="center"><img src="./6.gif" width="300"/><br/>number_6</div> |
| ٦٠ | number_60 | <div align="center"><img src="./60.gif" width="300"/><br/>number_60</div> |
| ٦٠٠ | number_600 | <div align="center"><img src="./600.gif" width="300"/><br/>number_600</div> |
| ٧ | number_7 | <div align="center"><img src="./7.gif" width="300"/><br/>number_7</div> |
| ٧٠ | number_70 | <div align="center"><img src="./70.gif" width="300"/><br/>number_70</div> |
| ٧٠٠ | number_700 | <div align="center"><img src="./700.gif" width="300"/><br/>number_700</div> |
| ٨ | number_8 | <div align="center"><img src="./8.gif" width="300"/><br/>number_8</div> |
| ٨٠ | number_80 | <div align="center"><img src="./80.gif" width="300"/><br/>number_80</div> |
| ٨٠٠ | number_800 | <div align="center"><img src="./800.gif" width="300"/><br/>number_800</div> |
| ٩ | number_9 | <div align="center"><img src="./9.gif" width="300"/><br/>number_9</div> |
| ٩٠ | number_90 | <div align="center"><img src="./90.gif" width="300"/><br/>number_90</div> |
| ٩٠٠ | number_900 | <div align="center"><img src="./900.gif" width="300"/><br/>number_900</div> |
| ء | hamza | <div align="center"><img src="./hamza.gif" width="300"/><br/>hamza</div> |
| أ | alif with hamza above | <div align="center"><img src="./alif%20with%20hamza%20above.gif" width="300"/><br/>alif with hamza above</div> |
| ؤ | Waaw with hamza | <div align="center"><img src="./Waaw%20with%20hamza.gif" width="300"/><br/>Waaw with hamza</div> |
| إ | alif with hamza below | <div align="center"><img src="./alif%20with%20hamza%20below.gif" width="300"/><br/>alif with hamza below</div> |
| ئ | Alif maqsoura with hamza | <div align="center"><img src="./Alif%20maqsoura%20with%20hamza.gif" width="300"/><br/>Alif maqsoura with hamza</div> |
| ئـ | hamza on line | <div align="center"><img src="./hamza%20on%20line.gif" width="300"/><br/>hamza on line</div> |
| ا | alif | <div align="center"><img src="./alif.gif" width="300"/><br/>alif</div> |
| آ | ALif with maad | <div align="center"><img src="./ALif%20with%20maad.gif" width="300"/><br/>ALif with maad</div> |
| آسف | Sorry | <div align="center"><img src="./Sorry.gif" width="300"/><br/>Sorry</div> |
| أب | father | <div align="center"><img src="./father.gif" width="300"/><br/>father</div> |
| أخذ إبرة | acupuncture | <div align="center"><img src="./acupuncture.gif" width="300"/><br/>acupuncture</div> |
| إدمان | addiction | <div align="center"><img src="./addiction.gif" width="300"/><br/>addiction</div> |
| أزمة قلبية | heart attack | <div align="center"><img src="./heart%20attack.gif" width="300"/><br/>heart attack</div> |
| إسعافات أولية | first aid | <div align="center"><img src="./first%20aid.gif" width="300"/><br/>first aid</div> |
| إسهال | diarrhea | <div align="center"><img src="./diarrhea.gif" width="300"/><br/>diarrhea</div> |
| أشعة ليزر | laser ray | <div align="center"><img src="./laser%20ray.gif" width="300"/><br/>laser ray</div> |
| إعاقة | hindrance | <div align="center"><img src="./hindrance.gif" width="300"/><br/>hindrance</div> |
| اعاقة بصرية | visual impairment | <div align="center"><img src="./visual%20impairment.gif" width="300"/><br/>visual impairment</div> |
| اعاقة جسدية | physical disability | <div align="center"><img src="./physical%20disability.gif" width="300"/><br/>physical disability</div> |
| إعاقة ذهنية | mentality hindrance | <div align="center"><img src="./mentality%20hindrance.gif" width="300"/><br/>mentality hindrance</div> |
| إعاقة سمعية | hearing hindrance | <div align="center"><img src="./hearing%20hindrance.gif" width="300"/><br/>hearing hindrance</div> |
| ال | Al | <div align="center"><img src="./Al.gif" width="300"/><br/>Al</div> |
| الأمعاء الدقيقة | Small intestine | <div align="center"><img src="./Small%20intestine.gif" width="300"/><br/>Small intestine</div> |
| الأمعاء الغليظة | Large intestine | <div align="center"><img src="./Large%20intestine.gif" width="300"/><br/>Large intestine</div> |
| البنكرياس | pancreas | <div align="center"><img src="./pancreas.gif" width="300"/><br/>pancreas</div> |
| التهاب | inflammation | <div align="center"><img src="./inflammation.gif" width="300"/><br/>inflammation</div> |
| الحمد لله | Alhamdulillah | <div align="center"><img src="./Alhamdulillah.gif" width="300"/><br/>Alhamdulillah</div> |
| الزائدة الدودية | Appendix | <div align="center"><img src="./Appendix.gif" width="300"/><br/>Appendix</div> |
| السلام عليكم | Salam aleikum | <div align="center"><img src="./Salam_aleikum.gif" width="300"/><br/>Salam aleikum</div> |
| ألم | pain | <div align="center"><img src="./pain.gif" width="300"/><br/>pain</div> |
| أم | mother | <div align="center"><img src="./mother.gif" width="300"/><br/>mother</div> |
| إمساك | constipation | <div align="center"><img src="./constipation.gif" width="300"/><br/>constipation</div> |
| أنا | me | <div align="center"><img src="./me.gif" width="300"/><br/>me</div> |
| أنا آسف | I am sorry | <div align="center"><img src="./I_am_sorry.gif" width="300"/><br/>I am sorry</div> |
| أنا بخير | I am fine | <div align="center"><img src="./I_am_fine.gif" width="300"/><br/>I am fine</div> |
| إنتشار | spread | <div align="center"><img src="./spread.gif" width="300"/><br/>spread</div> |
| انتهى | finish | <div align="center"><img src="./finish.gif" width="300"/><br/>finish</div> |
| أنسجة | tissue | <div align="center"><img src="./tissue.gif" width="300"/><br/>tissue</div> |
| ب | baa | <div align="center"><img src="./baa.gif" width="300"/><br/>baa</div> |
| بكتريا | bacterium | <div align="center"><img src="./bacterium.gif" width="300"/><br/>bacterium</div> |
| بلعوم | pharynx | <div align="center"><img src="./pharynx.gif" width="300"/><br/>pharynx</div> |
| بيت | house | <div align="center"><img src="./house.gif" width="300"/><br/>house</div> |
| ة | taa marbuuTa | <div align="center"><img src="./taa%20marbuuTa.gif" width="300"/><br/>taa marbuuTa</div> |
| تحليل دم | blood analysis | <div align="center"><img src="./blood%20analysis.gif" width="300"/><br/>blood analysis</div> |
| تحليل طبي | analysis | <div align="center"><img src="./analysis.gif" width="300"/><br/>analysis</div> |
| تساقط الشعر | Loss of hair | <div align="center"><img src="./Loss%20of%20hair.gif" width="300"/><br/>Loss of hair</div> |
| تطعيم | inoculation | <div align="center"><img src="./inoculation.gif" width="300"/><br/>inoculation</div> |
| تفكير | thinking | <div align="center"><img src="./thinking.gif" width="300"/><br/>thinking</div> |
| تلقيح | pollination | <div align="center"><img src="./pollination.gif" width="300"/><br/>pollination</div> |
| توحد / أوتيزم | oneness | <div align="center"><img src="./oneness.gif" width="300"/><br/>oneness</div> |
| تورم | swelling | <div align="center"><img src="./swelling.gif" width="300"/><br/>swelling</div> |
| ث | tha | <div align="center"><img src="./tha.gif" width="300"/><br/>tha</div> |
| ج | Jiim | <div align="center"><img src="./Jiim.gif" width="300"/><br/>Jiim</div> |
| جرثومة | microbe | <div align="center"><img src="./microbe.gif" width="300"/><br/>microbe</div> |
| جرح نازف | wound | <div align="center"><img src="./wound.gif" width="300"/><br/>wound</div> |
| جمجة | skull | <div align="center"><img src="./skull.gif" width="300"/><br/>skull</div> |
| جهاز تنفسي | Respiratory device | <div align="center"><img src="./Respiratory%20device.gif" width="300"/><br/>Respiratory device</div> |
| جهاز عصبي | nervous system | <div align="center"><img src="./nervous%20system.gif" width="300"/><br/>nervous system</div> |
| جهاز قياس الضغط | sphygmometroscope | <div align="center"><img src="./sphygmometroscope.gif" width="300"/><br/>sphygmometroscope</div> |
| جهاز هضمي | digestive system | <div align="center"><img src="./digestive%20system.gif" width="300"/><br/>digestive system</div> |
| جيد | good | <div align="center"><img src="./good.gif" width="300"/><br/>good</div> |
| ح | Haa | <div align="center"><img src="./Haa.gif" width="300"/><br/>Haa</div> |
| حروق | burning | <div align="center"><img src="./burning.gif" width="300"/><br/>burning</div> |
| حزين | sad | <div align="center"><img src="./sad.gif" width="300"/><br/>sad</div> |
| حساسية | allergy | <div align="center"><img src="./allergy.gif" width="300"/><br/>allergy</div> |
| حكة / هرش | itch | <div align="center"><img src="./itch.gif" width="300"/><br/>itch</div> |
| حمى | fever | <div align="center"><img src="./fever.gif" width="300"/><br/>fever</div> |
| حواس خمس | five senses | <div align="center"><img src="./five%20senses.gif" width="300"/><br/>five senses</div> |
| خ | kha | <div align="center"><img src="./kha.gif" width="300"/><br/>kha</div> |
| د | daal | <div align="center"><img src="./daal.gif" width="300"/><br/>daal</div> |
| دواء | medicine | <div align="center"><img src="./medicine.gif" width="300"/><br/>medicine</div> |
| دواء شراب | liquid medicine | <div align="center"><img src="./liquid%20medicine.gif" width="300"/><br/>liquid medicine</div> |
| دورة شهرية | monthly circulation | <div align="center"><img src="./monthly%20circulation.gif" width="300"/><br/>monthly circulation</div> |
| ر | raa | <div align="center"><img src="./raa.gif" width="300"/><br/>raa</div> |
| رئتان | lungs | <div align="center"><img src="./lungs.gif" width="300"/><br/>lungs</div> |
| زكام | cold | <div align="center"><img src="./cold.gif" width="300"/><br/>cold</div> |
| س | siin | <div align="center"><img src="./siin.gif" width="300"/><br/>siin</div> |
| سرطان | cancer | <div align="center"><img src="./cancer.gif" width="300"/><br/>cancer</div> |
| سعيد | happy | <div align="center"><img src="./happy.gif" width="300"/><br/>happy</div> |
| سكتة قلبية | Heart failure | <div align="center"><img src="./Heart%20failure.gif" width="300"/><br/>Heart failure</div> |
| سماعة أذن | stethoscope | <div align="center"><img src="./stethoscope.gif" width="300"/><br/>stethoscope</div> |
| ش | shiin | <div align="center"><img src="./shiin.gif" width="300"/><br/>shiin</div> |
| شاش / ضمادة | gauze | <div align="center"><img src="./gauze.gif" width="300"/><br/>gauze</div> |
| شريط لاصق / بلاستر | adhesive tape | <div align="center"><img src="./adhesive%20tape.gif" width="300"/><br/>adhesive tape</div> |
| شكراً | Thanks | <div align="center"><img src="./Thanks.gif" width="300"/><br/>Thanks</div> |
| شكراً | thanks | <div align="center"><img src="./thanks.gif" width="300"/><br/>thanks</div> |
| شلل دماغي | Cerebral paralysis | <div align="center"><img src="./Cerebral%20paralysis.gif" width="300"/><br/>Cerebral paralysis</div> |
| شلل نصفي | hemiplegia | <div align="center"><img src="./hemiplegia.gif" width="300"/><br/>hemiplegia</div> |
| شهيق - زفير | Ins and Outs | <div align="center"><img src="./Ins%20and%20Outs.gif" width="300"/><br/>Ins and Outs</div> |
| ص | Saad | <div align="center"><img src="./Saad.gif" width="300"/><br/>Saad</div> |
| صباح الخير | Good morning | <div align="center"><img src="./Good_morning.gif" width="300"/><br/>Good morning</div> |
| صداع | headache | <div align="center"><img src="./headache.gif" width="300"/><br/>headache</div> |
| صورة اشعة | ray photo | <div align="center"><img src="./ray%20photo.gif" width="300"/><br/>ray photo</div> |
| صيدلية | pharmacy | <div align="center"><img src="./pharmacy.gif" width="300"/><br/>pharmacy</div> |
| ض | Daad | <div align="center"><img src="./Daad.gif" width="300"/><br/>Daad</div> |
| ضغط الدم | blood pressure | <div align="center"><img src="./blood%20pressure.gif" width="300"/><br/>blood pressure</div> |
| ط | Taa | <div align="center"><img src="./Taa.gif" width="300"/><br/>Taa</div> |
| طفل | baby | <div align="center"><img src="./baby.gif" width="300"/><br/>baby</div> |
| ظ | Zaa | <div align="center"><img src="./Zaa.gif" width="300"/><br/>Zaa</div> |
| ع | Ayn | <div align="center"><img src="./Ayn.gif" width="300"/><br/>Ayn</div> |
| عادي | normal | <div align="center"><img src="./normal.gif" width="300"/><br/>normal</div> |
| عدوى | infection | <div align="center"><img src="./infection.gif" width="300"/><br/>infection</div> |
| عصب | nerve | <div align="center"><img src="./nerve.gif" width="300"/><br/>nerve</div> |
| عضلة | muscle | <div align="center"><img src="./muscle.gif" width="300"/><br/>muscle</div> |
| عملية جراحية | surgery | <div align="center"><img src="./surgery.gif" width="300"/><br/>surgery</div> |
| عمود فقري | Backbone | <div align="center"><img src="./Backbone.gif" width="300"/><br/>Backbone</div> |
| غ | ghayn | <div align="center"><img src="./ghayn.gif" width="300"/><br/>ghayn</div> |
| ف | faa | <div align="center"><img src="./faa.gif" width="300"/><br/>faa</div> |
| فحص النظر | sight examination | <div align="center"><img src="./sight%20examination.gif" width="300"/><br/>sight examination</div> |
| فحص سريري | physical examination | <div align="center"><img src="./physical%20examination.gif" width="300"/><br/>physical examination</div> |
| فيروس | virus | <div align="center"><img src="./virus.gif" width="300"/><br/>virus</div> |
| ق | qaaf | <div align="center"><img src="./qaaf.gif" width="300"/><br/>qaaf</div> |
| قصبة هوائية | Trachea | <div align="center"><img src="./Trachea.gif" width="300"/><br/>Trachea</div> |
| قطارة | dropper | <div align="center"><img src="./dropper.gif" width="300"/><br/>dropper</div> |
| قف | stop | <div align="center"><img src="./stop.gif" width="300"/><br/>stop</div> |
| قفص صدري | Chest | <div align="center"><img src="./Chest.gif" width="300"/><br/>Chest</div> |
| قلب | heart | <div align="center"><img src="./heart.gif" width="300"/><br/>heart</div> |
| قلق | worry | <div align="center"><img src="./worry.gif" width="300"/><br/>worry</div> |
| كبد | liver | <div align="center"><img src="./liver.gif" width="300"/><br/>liver</div> |
| كبسولة | capsule | <div align="center"><img src="./capsule.gif" width="300"/><br/>capsule</div> |
| كيف حالك؟ | How are you | <div align="center"><img src="./How_are_you.gif" width="300"/><br/>How are you</div> |
| لا | laam Alif | <div align="center"><img src="./laam%20Alif.gif" width="300"/><br/>laam Alif</div> |
| ليس سيئاً | Not bad | <div align="center"><img src="./Not_bad.gif" width="300"/><br/>Not bad</div> |
| م | miim | <div align="center"><img src="./miim.gif" width="300"/><br/>miim</div> |
| مخدر/ بنج | anesthetist | <div align="center"><img src="./anesthetist.gif" width="300"/><br/>anesthetist</div> |
| مخدرات | drug's | <div align="center"><img src="./drug's.gif" width="300"/><br/>drug's</div> |
| مرض السكر / سكري | diabetes | <div align="center"><img src="./diabetes.gif" width="300"/><br/>diabetes</div> |
| مرض فقدان المناعة / الإيدز | Aids | <div align="center"><img src="./Aids.gif" width="300"/><br/>Aids</div> |
| مرهم | ointment | <div align="center"><img src="./ointment.gif" width="300"/><br/>ointment</div> |
| مريض / مرض | sick | <div align="center"><img src="./sick.gif" width="300"/><br/>sick</div> |
| مساء الخير | Good evening | <div align="center"><img src="./Good_evening.gif" width="300"/><br/>Good evening</div> |
| مستشفى | hospital | <div align="center"><img src="./hospital.gif" width="300"/><br/>hospital</div> |
| مسجد | mosque | <div align="center"><img src="./mosque.gif" width="300"/><br/>mosque</div> |
| مع السلامة | Good bye | <div align="center"><img src="./Good_bye.gif" width="300"/><br/>Good bye</div> |
| معافى | healthy | <div align="center"><img src="./healthy.gif" width="300"/><br/>healthy</div> |
| معمل التحاليل / مختبر | analysis laboratory | <div align="center"><img src="./analysis%20laboratory.gif" width="300"/><br/>analysis laboratory</div> |
| مغص | colic | <div align="center"><img src="./colic.gif" width="300"/><br/>colic</div> |
| مناعة | immunity | <div align="center"><img src="./immunity.gif" width="300"/><br/>immunity</div> |
| منغولي | mongoloid | <div align="center"><img src="./mongoloid.gif" width="300"/><br/>mongoloid</div> |
| مهم | important | <div align="center"><img src="./important.gif" width="300"/><br/>important</div> |
| مول | mall | <div align="center"><img src="./mall.gif" width="300"/><br/>mall</div> |
| ميزان حرارة | thermometer | <div align="center"><img src="./thermometer.gif" width="300"/><br/>thermometer</div> |
| ن | noon | <div align="center"><img src="./noon.gif" width="300"/><br/>noon</div> |
| نبض القلب | pulse | <div align="center"><img src="./pulse.gif" width="300"/><br/>pulse</div> |
| هيكل عظمي | Skeleton | <div align="center"><img src="./Skeleton.gif" width="300"/><br/>Skeleton</div> |
| و | waaw | <div align="center"><img src="./waaw.gif" width="300"/><br/>waaw</div> |
| وباء | epidemic | <div align="center"><img src="./epidemic.gif" width="300"/><br/>epidemic</div> |
| وجه | Face | <div align="center"><img src="./Face.gif" width="300"/><br/>Face</div> |
| ى | Alif maqsoura | <div align="center"><img src="./Alif%20maqsoura.gif" width="300"/><br/>Alif maqsoura</div> |
| يأكل | eat | <div align="center"><img src="./eat.gif" width="300"/><br/>eat</div> |
| يبني | build | <div align="center"><img src="./build.gif" width="300"/><br/>build</div> |
| يتنامى | grow | <div align="center"><img src="./grow.gif" width="300"/><br/>grow</div> |
| يحب | love | <div align="center"><img src="./love.gif" width="300"/><br/>love</div> |
| يحرث | plow | <div align="center"><img src="./plow.gif" width="300"/><br/>plow</div> |
| يحصد | harvest | <div align="center"><img src="./harvest.gif" width="300"/><br/>harvest</div> |
| يختار | choose | <div align="center"><img src="./choose.gif" width="300"/><br/>choose</div> |
| يدخن | smoke | <div align="center"><img src="./smoke.gif" width="300"/><br/>smoke</div> |
| يدعم | support | <div align="center"><img src="./support.gif" width="300"/><br/>support</div> |
| يزرع | plant | <div align="center"><img src="./plant.gif" width="300"/><br/>plant</div> |
| يساعد | help | <div align="center"><img src="./help.gif" width="300"/><br/>help</div> |
| يستحم | bathe | <div align="center"><img src="./bathe.gif" width="300"/><br/>bathe</div> |
| يستيقظ | wake up | <div align="center"><img src="./wake%20up.gif" width="300"/><br/>wake up</div> |
| يسعدني لقاءك | I am pleased to meet you | <div align="center"><img src="./I_am_pleased_to_meet_you.gif" width="300"/><br/>I am pleased to meet you</div> |
| يسقي | irrigate | <div align="center"><img src="./irrigate.gif" width="300"/><br/>irrigate</div> |
| يسكت | silence | <div align="center"><img src="./silence.gif" width="300"/><br/>silence</div> |
| يسمع | hear | <div align="center"><img src="./hear.gif" width="300"/><br/>hear</div> |
| يشرب | drink | <div align="center"><img src="./drink.gif" width="300"/><br/>drink</div> |
| يشم | inhale | <div align="center"><img src="./inhale.gif" width="300"/><br/>inhale</div> |
| يشوي | grill | <div align="center"><img src="./grill.gif" width="300"/><br/>grill</div> |
| يصبغ | dye | <div align="center"><img src="./dye.gif" width="300"/><br/>dye</div> |
| يصعد | rise | <div align="center"><img src="./rise.gif" width="300"/><br/>rise</div> |
| يفتح | open | <div align="center"><img src="./open.gif" width="300"/><br/>open</div> |
| يفكر | think | <div align="center"><img src="./think.gif" width="300"/><br/>think</div> |
| يقف | stand | <div align="center"><img src="./stand.gif" width="300"/><br/>stand</div> |
| يقفل ( يغلق ) | close | <div align="center"><img src="./close.gif" width="300"/><br/>close</div> |
| يكره | hate | <div align="center"><img src="./hate.gif" width="300"/><br/>hate</div> |
| يكسر | break | <div align="center"><img src="./break.gif" width="300"/><br/>break</div> |
| يمشي | walk | <div align="center"><img src="./walk.gif" width="300"/><br/>walk</div> |
| ينادي | call | <div align="center"><img src="./call.gif" width="300"/><br/>call</div> |
| ينام | sleep | <div align="center"><img src="./sleep.gif" width="300"/><br/>sleep</div> |
| ينزل | descend | <div align="center"><img src="./descend.gif" width="300"/><br/>descend</div> |
