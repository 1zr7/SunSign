const fs = require('fs');
const { execSync } = require('child_process');

const excelPath = 'C:/Users/h1zr7/OneDrive/Desktop/v2_sunsign/sunsign/ml/dataset/rgb_data/KArSL- 190/KARSL-190_Labels.xlsx';
const pyOut = execSync(
  `python -c "import pandas as pd, json; df=pd.read_excel(r'${excelPath}'); print(json.dumps({str(row['Sign-English']).strip():str(row['Sign-Arabic']) for _,row in df.iterrows() if pd.notna(row['Sign-English'])}))"`,
  { encoding: 'utf8' }
).trim();

const arLookup = JSON.parse(pyOut);
const arManual = {
  'Alhamdulillah':           'الحمد لله',
  'Good bye':                'مع السلامة',
  'Good evening':            'مساء الخير',
  'Good morning':            'صباح الخير',
  'How are you':             'كيف حالك؟',
  'I am fine':               'أنا بخير',
  'I am pleased to meet you':'يسعدني لقاءك',
  'I am sorry':              'أنا آسف',
  'Not bad':                 'ليس سيئاً',
  'Salam aleikum':           'السلام عليكم',
  'Sorry':                   'آسف',
  'Thanks':                  'شكراً',
  'thanks':                  'شكراً',
  'baby':                    'طفل',
  'father':                  'أب',
  'finish':                  'انتهى',
  'good':                    'جيد',
  'happy':                   'سعيد',
  'house':                   'بيت',
  'important':               'مهم',
  'love':                    'يحب',
  'mall':                    'مول',
  'me':                      'أنا',
  'mosque':                  'مسجد',
  'mother':                  'أم',
  'normal':                  'عادي',
  'sad':                     'حزين',
  'stop':                    'قف',
  'thinking':                'تفكير',
  'worry':                   'قلق',
  'number_0':   '٠', 'number_1':   '١', 'number_2':   '٢', 'number_3':   '٣',
  'number_4':   '٤', 'number_5':   '٥', 'number_6':   '٦', 'number_7':   '٧',
  'number_8':   '٨', 'number_9':   '٩', 'number_10':  '١٠', 'number_20':  '٢٠',
  'number_30':  '٣٠', 'number_40':  '٤٠', 'number_50':  '٥٠', 'number_60':  '٦٠',
  'number_70':  '٧٠', 'number_80':  '٨٠', 'number_90':  '٩٠', 'number_100': '١٠٠',
  'number_200': '٢٠٠', 'number_300': '٣٠٠', 'number_400': '٤٠٠', 'number_500': '٥٠٠',
  'number_600': '٦٠0', 'number_700': '٧٠٠', 'number_800': '٨٠٠', 'number_900': '٩٠٠',
  'number_1000': '١٠٠٠', 'number_1000000': '١٬٠٠٠٬٠٠٠', 'number_10000000': '١٠٬٠٠٠٬٠٠٠',
};

const fullDict = { ...arLookup, ...arManual };

const targetDir = 'src/utils';
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

fs.writeFileSync('src/utils/arabicDictionary.ts', `// Auto-generated dictionary \nexport const arabicDictionary: Record<string, string> = ${JSON.stringify(fullDict, null, 2)};\n`);
console.log('Generated arabicDictionary.ts');
