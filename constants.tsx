
import { Prize } from './types';

export const CONTACT_CONFIG = {
  phone: "37068085874", 
  email: "your-email@example.com"
};

/**
 * VOICE ARCHIVE MAPPING
 * Optimized for direct streaming via raw.githubusercontent.com
 */
export const EXTERNAL_VOICE_URLS: Record<number, string> = {
  0: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_0.webm",
  1: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_1.webm",
  2: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_2.webm",
  3: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_3.webm",
  4: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_4.webm",
  5: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_5.webm",
  6: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_6.webm",
  7: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_7.webm",
  8: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_8.webm",
  9: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_9.webm",
  10: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_10.webm",
  11: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_11.webm",
  12: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_12.webm",
  13: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_13.webm",
  14: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_14.webm",
  15: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_15.webm",
  16: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_16.webm",
  17: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_17.webm",
  18: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_18.webm",
  19: "https://raw.githubusercontent.com/arcyniiegas/elysium-voice-archive2/main/elysium_reason_19.webm",
};

export const MUSEUMS: Prize[] = [
  {
    id: 1,
    name: "Instituto Inhotim",
    description: "A place where art breathes among the trees. Our first stop on this journey into beauty.",
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1000",
    ticketUrl: "https://www.inhotim.org.br/" 
  },
  {
    id: 2,
    name: "Museum of Tomorrow",
    description: "A science museum exploring the possibilities of the future. Let us look together at what is yet to come.",
    image: "https://images.unsplash.com/photo-1544413647-79599554707c?auto=format&fit=crop&q=80&w=1000",
    ticketUrl: "https://museudoamanha.org.br/"
  },
  {
    id: 3,
    name: "Ricardo Brennand Institute",
    description: "A castle in the middle of a modern world. A reminder that our love is a story worthy of knightly legends.",
    image: "https://images.unsplash.com/photo-1590073844006-33379778ae09?auto=format&fit=crop&q=80&w=1000",
    ticketUrl: "https://www.institutoricardobrennand.org.br/"
  },
  {
    id: 4,
    name: "Oscar Niemeyer Museum",
    description: "The 'Eye' of Curitiba. An architectural masterpiece that watches the world as curiously as I watch you.",
    image: "https://images.unsplash.com/photo-1518998053574-53ee796d7ec2?auto=format&fit=crop&q=80&w=1000",
    ticketUrl: "https://www.museuoscarniemeyer.org.br/"
  },
  {
    id: 5,
    name: "Our Dinner. My Gift.",
    description: "The final relic. No walls, no museums – just us. Wherever you wish, I will take you there.",
    image: "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?auto=format&fit=crop&q=80&w=1000",
    ticketUrl: "#"
  }
];

export const REASONS_WHY_I_LOVE_YOU: string[] = [
  "Aš myliu tavo gebėjimą suprasti, įsijausti ir priimti mane net tuomet, kai man sunku priimti save patį. Aš esu tau amžinai dėkingas už tavo supratingumą ir gebėjimą atjausti bei priimti mane tokį, koks esu.",
  "Aš myliu tavo rūpestį ir paslaugumą. Ne kaip pareigą, o kaip natūralią tavo savybę. Aš myliu, kad pastebi dalykus dar jiems netapus problema ir spręndi juos nesitikėdamas sulaukti tokio paties atsako.",
  "Joker korta – tu gali užduoti man vieną klausimą, į kurį aš prisiekiu atsakyti nuoširdžiai ir atvirai. Aboot bet ką.",
  "Aš myliu tavo gebėjimą pastebėti mano vidines subtilybes, kurių pats galbūt neįvardinu, ir reaguoti į jas taip, kad jaučiu tavo supratimą be žodžių.",
  "Aš myliu tavo gebėjimą priimti mano klaidas taip, kad jos tampa mūsų bendra patirtimi, o ne priežastimi konfliktui. Tai leidžia man būti užtikrintu, kad esame komanda ir palaikome vienas kidą.",
  "Aš myliu tavo gebėjimą susilaikyti nuo vertinimų ir patarimų, kai man reikia atrasti atsakymą pačiam. Tavo buvimas šalia netikrinant ir nevadovaujant suteikia man galimybę pasitikėti savo sprendimais.",
  "Aš myliu tavo kantrybę, kai mūsų santykiai reikalauja kompromisų ar prisitaikymo. Tu sugebėjai išmokyti mane, kad tikra meilė nėra apie manipuliaciją ar pergalę, o apie nuoseklų buvimą šalia, net kai tai nepatogu ar sunku.",
  "Aš myliu tavo kantrybę, kuomet bandome naujus dalykus, nes ji leidžia man klaidžioti, klysti ir atrasti save be baimės būti vertinamam.",
  "Aš myliu tavo gebėjimą būti pažeidžiamu, nes tai kuria pasitikėjimą, kuriame nereikia slėptis ar apsimetinėti stipresniu, nei esi.",
  "Joker korta – užduok man nedidelį iššūkį ir stebėk, kaip aš jį įgyvendinu.",
  "Aš myliu tai, kaip tavo ramus protas nuramina mano chaotiškas mintis, o šilta širdis sušildo mano abejojančią sielą. Aš myliu, kad sugebi pajusti, ko man reikia, ir atsakyti taip, kad jaučiuosi suprastas ir palaikomas.",
  "Aš myliu tavo gerumą – man ir visam likusiam pasauliui. Aš myliu tavo drąsą būti švelniu pasaulyje, kuris nuolat reikalauja smurto.",
  "Aš myliu tavo užsispyrimą kurti bendrą ateitį nepaisant visko. Tavo ramybė ir abejonių nebuvimas daro mane drąsesnį kalbėti, planuoti ir įsitraukti, nes žinau, kad tai bus daroma sąžiningai ir kartu.",
  "Aš myliu tave už tai, kad šalia tavęs galiu būti toks, koks esu, nepaslėpdamas nei baimių, nei svajonių, ir tai daro mane visavertį.",
  "Joker korta – paprašyk manęs prisiminti vieną mūsų bendrą akimirką ir aš pasakysiu, k tuomet tikrai galvojau ar jaučiau.",
  "Joker korta – užduok man provokuojantį klausimą. Be ribų, be užuolankų, be gėdos.",
  "Aš myliu tavo ištikimybę savo žodžiams ir veiksmams, kurie nesikeičia net tuomet, kai tai tampa labai nepatogu. Tavo pastovumas man suteikia saugumą, kurio niekas kitas negali duoti.",
  "Aš myliu tavo gebėjimą pamiršti save tam, kad suprastum mane, bet vis tiek išlikti ištikimu sau. Aš labai vertinu tavo altruizmą tokiose akimirkose, nes jos parodo tavo jausmų tikrumą.",
  "Aš myliu tavo gebėjimą suprasti, įsijausti ir priimti mane net tuomet, kai man sunku priimti save patį. Aš esu tau amžinai dėkingas už tavo supratingumą ir gebėjimą atjausti bei priimti mane tokį, koks esu.",
  "Aš myliu tavo besąlygišką meilę. Ne kaip pažadą ar deklaraciją, o kaip pastovų buvimą mano gyvenime. Ji nereikalauja iš manęs būti stipresniu ar patogesniu. Aš ją jaučiu ir tada, kai viskas gerai, ir tada, kai pats savimi abejoju."
];

export const RIDDLES = [
  {
    question: "I am the thing you give me without moving a muscle, and the reason I built this world for you. What is the only currency accepted here?",
    answer: "love"
  },
  {
    question: "A conversation in the dark, where voices are silent but bodies speak in rhythms. What am I?",
    answer: "sex"
  },
  {
    question: "A fire that needs no wood, only a spark between two souls. What am I?",
    answer: "passion"
  },
  {
    question: "I build a bridge of sound and meaning where silence once stood. What am I?",
    answer: "communication"
  },
  {
    question: "A mirror that never lies, even when the reflection is painful to see in the rain. What am I?",
    answer: "honesty"
  },
  {
    question: "The balance that keeps two paths close, yet separate. What am I?",
    answer: "independence"
  },
  {
    question: "I treat your limits as real and your voice as equal to mine. What am I?",
    answer: "respect"
  },
  {
    question: "I am the choice to stand in the same place, even as the ground shifts. What am I?",
    answer: "loyalty"
  }
];
