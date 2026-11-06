/* 주역 동전점 (tool-juyeok.html) — plain script, no deps.
 * 3 coins x 6 lines casting, renders 본괘/지괘 with original short interpretations.
 * Defensive: works whether or not js/tools.js defined window.TOOLS.
 */
(function () {
  "use strict";

  var TOOLS = window.TOOLS || {};
  var TRIGRAMS = TOOLS.TRIGRAMS || [
    { name: "건", hanja: "乾", symbol: "☰" },
    { name: "태", hanja: "兌", symbol: "☱" },
    { name: "리", hanja: "離", symbol: "☲" },
    { name: "진", hanja: "震", symbol: "☳" },
    { name: "손", hanja: "巽", symbol: "☴" },
    { name: "감", hanja: "坎", symbol: "☵" },
    { name: "곤", hanja: "艮", symbol: "☷" },
    { name: "중", hanja: "坤", symbol: "☶" }
  ];

  var LINE_NAMES = ["초효", "이효", "삼효", "사효", "오효", "상효"];

  /* 64 hexagrams, binary order: index = upper*8 + lower (0=건 1=태 2=리 3=진 4=손 5=감 6=곤 7=중).
   * All interpretation texts are original, written for this tool. */
  var HEXAGRAMS = [
    { name: "건위천", hanja: "乾爲天", upper: 0, lower: 0, text: "하늘의 기운이 그대로 내려오는 가장 강한 괘입니다. 곧은 마음과 강한 의지로 나아가면 만사가 형통합니다. 리더의 자리에 서는 시기이나, 오만해지면 하늘이 돕지 않습니다. 시작은 힘차게, 마무리는 겸손하게 하세요." },
    { name: "천택리", hanja: "天澤履", upper: 0, lower: 1, text: "호랑이 꼬리를 밟듯 조심스럽게 걸어야 하는 때입니다. 예의와 순서를 지키면 작은 일도 큰 복이 됩니다. 급하게 뛰어오르지 말고 한 걸음씩 나아가세요. 아래 사람을 공경하면 길이 열립니다." },
    { name: "천화동인", hanja: "天火同人", upper: 0, lower: 2, text: "사람들과 마음을 합칠 때 큰일을 이룹니다. 혼자보다 함께할 때 운이 열리는 상이니 인연을 소중히 하세요. 편을 가르지 말고 두루 화합하면 성공합니다. 넓은 들판에서 사람을 만나는 기운입니다." },
    { name: "천뢰무망", hanja: "天雷无妄", upper: 0, lower: 3, text: "꾸밈없이 천명을 따를 때 복이 옵니다. 진실하고 바르게 행동하면 하늘의 도움이 따릅니다. 억지로 꾸미거나 남을 속이면 재앙이 되니 조심하세요. 있는 그대로의 마음으로 나아가는 것이 답입니다." },
    { name: "천풍구", hanja: "天風姤", upper: 0, lower: 4, text: "뜻밖의 만남이 다가오는 상입니다. 작은 인연이 크게 번질 수 있으니 만남을 가볍게 여기지 마세요. 다만 음기가 스며드는 시기이니 방심은 금물입니다. 새로운 인연은 신중히 살펴보세요." },
    { name: "천수송", hanja: "天水訟", upper: 0, lower: 5, text: "다툼과 송사의 기운이 도는 때입니다. 지금 싸우면 이겨도 잃는 것이 많으니 한 발 물러서세요. 화해를 꾀하는 것이 지혜이며, 큰일을 벌이기보다 때를 기다리세요. 중재자를 구하면 일이 풀립니다." },
    { name: "천산돈", hanja: "天山遯", upper: 0, lower: 6, text: "물러남이 곧 나아감인 시기입니다. 지금은 나서지 말고 몸을 낮출 때입니다. 어두운 기운이 강해지니 무리한 도전은 피하세요. 때를 기다리며 힘을 기르면 다시 일어설 수 있습니다." },
    { name: "천지비", hanja: "天地否", upper: 0, lower: 7, text: "하늘과 땅이 멀어져 사람의 마음이 맞지 않는 시기입니다. 일이 막히더라도 억지로 밀어붙이지 말고 때를 기다리세요. 어둠이 걷히면 새벽이 오듯 기회도 다시 옵니다. 내실을 다지는 시간으로 삼으세요." },
    { name: "택천쾌", hanja: "澤天夬", upper: 1, lower: 0, text: "과감히 결단할 때가 왔습니다. 잘못된 것을 끊어내면 운이 열립니다. 정직하게 알리고 떳떳하게 행동하세요. 작은 이익에 흔들리면 결단이 흐려지니 중심을 잡으세요." },
    { name: "태위택", hanja: "兌爲澤", upper: 1, lower: 1, text: "기쁨과 즐거움의 기운이 가득한 괘입니다. 마음이 통하는 사람과 함께하면 행복이 배가됩니다. 다만 즐거움에 빠져 절도를 잃지 마세요. 진심 어린 기쁨은 복을 부릅니다." },
    { name: "택화혁", hanja: "澤火革", upper: 1, lower: 2, text: "낡은 것을 버리고 새롭게 바꿀 때입니다. 개혁은 믿음 위에서 이루어지니 먼저 신뢰를 쌓으세요. 때를 놓치면 기회가 사라지니 결심했다면 미루지 마세요. 바꾸는 용기가 운을 바꿉니다." },
    { name: "택뢰수", hanja: "澤雷隨", upper: 1, lower: 3, text: "따르고 맡기는 지혜가 필요한 때입니다. 스스로 나서기보다 잘 이끌어주는 사람을 따르세요. 연애운이 좋은 상이니 인연을 소중히 하세요. 즐거움에 취해 판단력을 잃지 마십시오." },
    { name: "택풍대과", hanja: "澤風大過", upper: 1, lower: 4, text: "기둥이 휘는 상으로 큰 부담이 어깨 위에 있습니다. 혼자 감당하려 하지 말고 주변의 도움을 구하세요. 무리한 확장은 독이 되니 균형을 되찾는 것이 급선무입니다." },
    { name: "택수곤", hanja: "澤水困", upper: 1, lower: 5, text: "연못에 물이 빠져 곤궁한 시기입니다. 말은 통하지 않고 몸은 지치나, 곧은 마음을 잃지 않으면 귀인이 나타납니다. 참고 견디는 것이 지금의 지혜입니다. 어려움이 사람을 단련시킵니다." },
    { name: "택산함", hanja: "澤山咸", upper: 1, lower: 6, text: "마음이 통하는 상입니다. 진심으로 다가가면 상대의 마음이 열립니다. 연애와 결혼에 좋은 기운이니 솔직한 마음을 전하세요. 겉치레보다 진심이 답입니다." },
    { name: "택지췌", hanja: "澤地萃", upper: 1, lower: 7, text: "사람이 모이는 상입니다. 뜻을 함께할 동료를 모으면 큰일을 이룹니다. 모임과 협력에 좋은 때이나, 모인 힘을 바르게 써야 합니다. 중심을 잡는 리더의 역할이 중요합니다." },
    { name: "화천대유", hanja: "火天大有", upper: 2, lower: 0, text: "크게 가지는 상으로 노력의 결실이 풍성하게 돌아옵니다. 얻은 것을 독차지하지 말고 나누면 복이 더 커집니다. 겸손하면 큰 부를 오래 지킵니다. 풍요를 나누는 마음이 핵심입니다." },
    { name: "화택규", hanja: "火澤睽", upper: 2, lower: 1, text: "서로 등 돌린 시기로 작은 일에 마음이 멀어질 수 있으니 말조심이 필요합니다. 그러나 다른 점이 오히려 보완이 되니, 다름을 인정하면 길합니다. 작은 일부터 화합을 도모하세요." },
    { name: "이위화", hanja: "離爲火", upper: 2, lower: 2, text: "불의 기운이 겹쳐 밝은 지혜로 어둠을 비추면 일이 풀립니다. 겉은 화려하나 속이 비지 않도록 실속을 챙기세요. 정의로운 마음으로 나아가면 성공합니다. 빛나는 때일수록 내면을 단단히 하세요." },
    { name: "화뢰서합", hanja: "火雷噬嗑", upper: 2, lower: 3, text: "막힌 것을 깨물어 여는 상입니다. 장애물을 과감히 제거하면 길이 열립니다. 공정한 판단으로 문제를 처리하세요. 미루면 일이 더 커지니 지금 해결하는 것이 좋습니다." },
    { name: "화풍정", hanja: "火風鼎", upper: 2, lower: 4, text: "솥의 상으로 새로운 질서를 세우고 사람을 키우는 시기입니다. 맛있는 음식을 나누듯 베풀면 인심이 모입니다. 큰 그릇의 마음이 필요합니다. 조직을 세우기에 좋은 때입니다." },
    { name: "화수미제", hanja: "火水未濟", upper: 2, lower: 5, text: "아직 이루지 못한 상입니다. 일이 끝나가는 듯하지만 한 걸음 남았으니 마지막까지 방심하지 마세요. 마무리를 단단히 하면 성공하고, 젊은 기운으로 새 출발하기에도 좋습니다." },
    { name: "화산려", hanja: "火山旅", upper: 2, lower: 6, text: "나그네의 상으로 낯선 곳에서의 도전입니다. 몸을 낮추고 예의를 지키면 작은 행운이 따릅니다. 머무름에 집착하지 말고 흐름을 타세요. 신중함이 가장 큰 무기입니다." },
    { name: "화지진", hanja: "火地晉", upper: 2, lower: 7, text: "해가 땅 위로 오르는 상입니다. 실력을 인정받아 승진과 합격의 기운이 큽니다. 밝게 나아가되 교만하지 마세요. 자신의 능력을 마음껏 펼칠 때입니다." },
    { name: "뇌천대장", hanja: "雷天大壯", upper: 3, lower: 0, text: "우레처럼 강한 힘의 시기입니다. 기세가 대단하나 힘으로만 밀면 부러지니 바른 길로 나아가세요. 음기를 조심하고 양기의 힘을 바르게 쓰면 크게 이룹니다." },
    { name: "뇌택귀매", hanja: "雷澤歸妹", upper: 3, lower: 1, text: "때에 맞지 않는 인연의 상입니다. 서두르는 인연은 후회를 남기니 순서와 도리를 지키세요. 지금은 인연을 깊이 살필 때입니다. 조급함이 가장 큰 적입니다." },
    { name: "뇌화풍", hanja: "雷火豊", upper: 3, lower: 2, text: "크게 풍성한 상으로 한창 기세가 오를 때이니 적극적으로 나아가세요. 그러나 한낮의 해도 기울듯 정점에서는 겸손을 준비하세요. 나눌 줄 알면 풍요가 오래갑니다." },
    { name: "진위뢰", hanja: "震爲雷", upper: 3, lower: 3, text: "우레가 거듭 치는 상입니다. 두려운 일이 생겨도 중심을 잡으면 복이 됩니다. 놀람 뒤에 오는 침착함이 귀중합니다. 두려움을 이기면 한 단계 성장합니다." },
    { name: "뇌풍항", hanja: "雷風恒", upper: 3, lower: 4, text: "오래도록 이어지는 상입니다. 꾸준함이 가장 큰 힘이니 변함없는 마음으로 나아가세요. 부부와 동업의 인연이 길게 가니 서로를 존중하세요. 흔들리지 않으면 성공합니다." },
    { name: "뇌수해", hanja: "雷水解", upper: 3, lower: 5, text: "매듭이 풀리는 상입니다. 오래 막혔던 일이 시원하게 해결되니 서둘러 처리하면 더 좋습니다. 어려웠던 인연도 풀리니 마음의 짐을 내려놓으세요." },
    { name: "뇌산소과", hanja: "雷山小過", upper: 3, lower: 6, text: "작은 것을 넘어서는 상입니다. 작은 일은 되어도 큰일은 아직 때가 아닙니다. 몸을 낮추고 조용히 지내세요. 새처럼 날기보다 둥지를 지키는 것이 좋습니다." },
    { name: "뇌지예", hanja: "雷地豫", upper: 3, lower: 7, text: "기쁨의 우레가 울리는 상입니다. 일이 순조롭게 풀리고 마음이 즐거워집니다. 미리 준비한 사람에게 복이 오니 음악처럼 리듬을 타며 나아가세요." },
    { name: "풍천소축", hanja: "風天小畜", upper: 4, lower: 0, text: "작은 것을 모으는 상입니다. 큰 힘은 아직 모이지 않았으니 조금씩 쌓으세요. 아랫사람의 마음을 얻으면 일이 풀립니다. 참고 모으는 지혜가 필요한 때입니다." },
    { name: "풍택중부", hanja: "風澤中孚", upper: 4, lower: 1, text: "마음속 깊은 믿음의 상입니다. 진심이 통하면 먼 곳까지 미칩니다. 약속을 지키는 것이 최고의 운이니 성실하게 대하세요. 믿음이 모든 것을 이룹니다." },
    { name: "풍화가인", hanja: "風火家人", upper: 4, lower: 2, text: "집안의 화목을 다지는 상입니다. 가족이 화합하면 바깥일도 잘 풀립니다. 가정을 먼저 돌보세요. 집이 편안해야 큰일을 할 수 있습니다." },
    { name: "풍뢰익", hanja: "風雷益", upper: 4, lower: 3, text: "더함의 상으로 좋은 일이 겹쳐 옵니다. 윗사람의 도움을 받고 아랫사람에게 베푸세요. 이익을 나누면 더 큰 복이 돌아옵니다. 베풂이 복을 부릅니다." },
    { name: "손위풍", hanja: "巽爲風", upper: 4, lower: 4, text: "바람의 기운이 겹친 상입니다. 부드럽게 스며들어 설득하면 통합니다. 겸손하고 순종하는 마음으로 나아가세요. 강하게 밀기보다 유연하게 움직이는 것이 좋습니다." },
    { name: "풍수환", hanja: "風水渙", upper: 4, lower: 5, text: "흩어진 것을 모으는 상입니다. 흩어진 마음과 재물이 다시 모이니 중심을 잡으세요. 흩어짐을 두려워 말고 흐름을 타세요. 큰 물결 앞에서는 침착함이 답입니다." },
    { name: "풍산점", hanja: "風山漸", upper: 4, lower: 6, text: "기러기가 날아오르듯 점진적으로 상승하는 상입니다. 서두르지 말고 순서대로 나아가면 자리를 잡습니다. 결혼과 취업에 좋은 기운이니 한 걸음씩 착실히 가세요." },
    { name: "풍지관", hanja: "風地觀", upper: 4, lower: 7, text: "우러러보며 돌아보는 상입니다. 자신의 모습을 비춰보고 성찰할 때입니다. 윗사람의 모범이 되어 아랫사람을 이끄세요. 관망하며 때를 기다리는 지혜도 필요합니다." },
    { name: "수천수", hanja: "水天需", upper: 5, lower: 0, text: "기다림의 상입니다. 구름이 하늘에 머물듯 때가 오기를 기다리세요. 서두르면 흉하고 기다리면 길합니다. 여유를 가지고 준비하면 기회가 옵니다." },
    { name: "수택절", hanja: "水澤節", upper: 5, lower: 1, text: "절도의 상으로 적당한 선을 지키면 복이 됩니다. 과하면 넘치고 모자라면 부족하니 균형을 맞추세요. 씀씀이를 절제하면 재물이 모입니다." },
    { name: "수화기제", hanja: "水火旣濟", upper: 5, lower: 2, text: "이미 이룬 상으로 일이 완성되었습니다. 그러나 끝까지 방심은 금물이니 처음의 마음을 잃지 마세요. 완성 뒤의 안정을 다지면 오래 유지됩니다." },
    { name: "수뢰둔", hanja: "水雷屯", upper: 5, lower: 3, text: "시작의 어려움이 있는 상입니다. 새싹이 땅을 뚫듯 처음은 힘드니 귀인의 도움을 구하고 서두르지 마세요. 어려움을 뚫고 나면 크게 성장합니다." },
    { name: "수풍정", hanja: "水風井", upper: 5, lower: 4, text: "우물의 상입니다. 깊이 파면 맑은 물이 나오듯 꾸준한 노력으로 기반을 다지세요. 남을 돕는 마음이 샘물처럼 솟아납니다. 뿌리를 튼튼히 하는 때입니다." },
    { name: "감위수", hanja: "坎爲水", upper: 5, lower: 5, text: "험한 물이 겹친 상으로 어려움이 거듭 옵니다. 그러나 진실한 마음으로 헤쳐나가면 벗어납니다. 두려움에 사로잡히지 말고 한 걸음씩 나아가세요. 험한 때일수록 믿음이 힘입니다." },
    { name: "수산건", hanja: "水山蹇", upper: 5, lower: 6, text: "나아가기 힘든 상입니다. 앞은 산 뒤는 물이니 무리하지 마세요. 때를 기다리며 내실을 다지는 것이 지혜입니다. 동쪽으로 도움을 구하면 길합니다." },
    { name: "수지비", hanja: "水地比", upper: 5, lower: 7, text: "친하고 가까워지는 상입니다. 사람들과 화합하면 큰 힘이 됩니다. 윗사람을 가까이하고 아랫사람을 품으세요. 혼자보다 함께할 때 운이 열립니다." },
    { name: "산천대축", hanja: "山天大畜", upper: 6, lower: 0, text: "크게 모으는 상입니다. 재물과 학식을 크게 쌓을 때이니 배움에 힘쓰세요. 소처럼 묵묵히 쌓아 올리면 큰 복이 됩니다. 모으는 자에게 하늘이 돕습니다." },
    { name: "산택손", hanja: "山澤損", upper: 6, lower: 1, text: "덜어냄의 상입니다. 가진 것을 나누면 마음이 편안해지고 복이 돌아옵니다. 탐욕을 줄이고 베풀면 결국 이득입니다. 손해 본 듯해도 길이 됩니다." },
    { name: "산화비", hanja: "山火賁", upper: 6, lower: 2, text: "꾸밈의 상으로 겉모습을 단정히 하면 인연이 좋아집니다. 그러나 꾸밈에만 치우치지 말고 실속을 챙기세요. 작은 일부터 아름답게 가꾸면 큰 복이 됩니다." },
    { name: "산뢰이", hanja: "山雷頤", upper: 6, lower: 3, text: "기르는 상입니다. 입으로 들어가는 것을 삼가고 말조심하세요. 자신을 기르고 남을 기르는 때이니 바른 양식으로 몸과 마음을 채우세요." },
    { name: "산풍고", hanja: "山風蠱", upper: 6, lower: 4, text: "썩은 것을 고치는 상입니다. 묵은 문제와 나쁜 습관을 바로잡을 때이니 용기를 내세요. 아버지의 일을 이어받아 새롭게 하면 길합니다." },
    { name: "산수몽", hanja: "山水蒙", upper: 6, lower: 5, text: "어린아이의 배움의 상입니다. 모르는 것은 부끄러워 말고 배우세요. 좋은 스승을 만나면 크게 성장합니다. 처음 배우는 자세로 임하면 길이 열립니다." },
    { name: "곤위산", hanja: "艮爲山", upper: 6, lower: 6, text: "산이 겹친 멈춤의 상입니다. 움직이지 말고 고요히 자신을 돌아보세요. 욕심을 멈추면 마음이 편안해집니다. 때를 기다리는 것이 지금의 답입니다." },
    { name: "산지박", hanja: "山地剝", upper: 6, lower: 7, text: "깎이는 상으로 작은 것들이 큰 것을 갉아먹는 시기입니다. 윗자리에 있으면 아랫사람을 살피세요. 무리한 확장을 멈추고 내실을 지키는 것이 중요합니다." },
    { name: "지천태", hanja: "地天泰", upper: 7, lower: 0, text: "크게 통하는 최고의 상입니다. 하늘과 땅이 통해 만사가 형통하고 윗사람과 아랫사람이 화합합니다. 지금이 가장 좋은 때이니 적극적으로 나아가세요." },
    { name: "지택림", hanja: "地澤臨", upper: 7, lower: 1, text: "임하는 상으로 좋은 기회가 다가오니 맞이할 준비를 하세요. 윗사람이 아랫사람을 어루만지듯 덕으로 이끄세요. 서두르면 기회가 커집니다." },
    { name: "지화명이", hanja: "地火明夷", upper: 7, lower: 2, text: "밝음이 땅속에 숨은 상으로 어두운 시기입니다. 그러나 마음의 빛을 잃지 마세요. 낮은 자세로 때를 기다리면 해가 다시 뜹니다. 어려울수록 내면의 지혜를 키우세요." },
    { name: "지뢰복", hanja: "地雷復", upper: 7, lower: 3, text: "돌아오는 상입니다. 잃었던 것이 돌아오고 운이 다시 트이니 희망을 가지세요. 새 출발에 좋은 때이니 과거의 실수를 교훈 삼아 나아가세요." },
    { name: "지풍승", hanja: "地風升", upper: 7, lower: 4, text: "오르는 상으로 나무가 자라듯 꾸준히 상승합니다. 남쪽으로 나아가면 길하고 귀인을 만납니다. 한 걸음씩 착실히 오르면 높은 자리에 이릅니다." },
    { name: "지수사", hanja: "地水師", upper: 7, lower: 5, text: "스승의 상으로 무리의 우두머리가 되어 이끄는 때입니다. 군자는 병사를 아끼듯 사람을 소중히 하세요. 정당한 명분으로 나아가면 승리합니다." },
    { name: "지산겸", hanja: "地山謙", upper: 7, lower: 6, text: "겸손의 상입니다. 낮출수록 높아지는 이치이니 공이 있어도 자랑하지 마세요. 겸손한 사람에게 하늘이 복을 내립니다. 겸손이 최고의 덕입니다." },
    { name: "중지곤", hanja: "坤爲地", upper: 7, lower: 7, text: "땅의 기운 그대로의 상입니다. 부드럽고 순종하는 마음으로 따르면 길합니다. 암말처럼 부지런히 나아가면 서남쪽에서 복을 얻습니다. 주도하기보다 따르는 것이 좋습니다." }
  ];

  /* ---- casting helpers ---- */
  function isYang(v) { return v === 7 || v === 9; }
  function isChanging(v) { return v === 6 || v === 9; }

  function lineLabel(v) {
    if (v === 9) return "노양 ⚡";
    if (v === 7) return "소양";
    if (v === 8) return "소음";
    return "노음 ⚡";
  }

  /* one coin: 앞=3, 뒷=2 */
  function tossCoin() { return Math.random() < 0.5 ? "뒷" : "앞"; }

  function tossLine() {
    var coins = [tossCoin(), tossCoin(), tossCoin()];
    var sum = 0;
    for (var i = 0; i < 3; i++) sum += (coins[i] === "앞" ? 3 : 2);
    return { coins: coins, value: sum };
  }

  function trigramIndex(bit0, bit1, bit2) {
    return bit0 + bit1 * 2 + bit2 * 4;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function $(id) { return document.getElementById(id); }

  function setText(el, s) {
    if (el) el.textContent = s;
  }

  /* ---- rendering ---- */
  function renderHexagram(container, values) {
    if (!container) return;
    container.innerHTML = "";
    /* draw top-down: 상효 first, 초효 last */
    for (var i = 5; i >= 0; i--) {
      var v = values[i];
      var d = document.createElement("div");
      var cls = "line " + (isYang(v) ? "yang" : "yin") + (isChanging(v) ? " changing" : "");
      d.setAttribute("class", cls);
      d.setAttribute("aria-label", LINE_NAMES[i] + " " + lineLabel(v));
      if (isYang(v)) {
        d.appendChild(document.createElement("i"));
      } else {
        d.appendChild(document.createElement("i"));
        d.appendChild(document.createElement("i"));
      }
      container.appendChild(d);
    }
  }

  function lineSummary(values) {
    var parts = [];
    for (var i = 0; i < 6; i++) parts.push(LINE_NAMES[i] + " " + lineLabel(values[i]));
    return parts.join(" · ");
  }

  function hexName(h) { return h.name + "(" + h.hanja + ")"; }

  function renderResult(values, question) {
    var lower = trigramIndex(isYang(values[0]) ? 1 : 0, isYang(values[1]) ? 1 : 0, isYang(values[2]) ? 1 : 0);
    var upper = trigramIndex(isYang(values[3]) ? 1 : 0, isYang(values[4]) ? 1 : 0, isYang(values[5]) ? 1 : 0);
    var main = HEXAGRAMS[upper * 8 + lower];

    var changed = [];
    var hasChanging = false;
    for (var i = 0; i < 6; i++) {
      var v = values[i];
      if (isChanging(v)) {
        hasChanging = true;
        changed.push(isYang(v) ? 0 : 1); /* old yang -> yin, old yin -> yang */
      } else {
        changed.push(isYang(v) ? 1 : 0);
      }
    }

    var changedHex = null;
    if (hasChanging) {
      var cl = trigramIndex(changed[0], changed[1], changed[2]);
      var cu = trigramIndex(changed[3], changed[4], changed[5]);
      changedHex = HEXAGRAMS[cu * 8 + cl];
    }

    var titleEl = $("juyeok-title");
    var triEl = $("juyeok-trigrams");
    var hexEl = $("juyeok-hexagram");
    var interpEl = $("juyeok-interp");
    var wrap = $("juyeok-result");

    var tU = TRIGRAMS[upper] || { name: "", hanja: "", symbol: "" };
    var tL = TRIGRAMS[lower] || { name: "", hanja: "", symbol: "" };

    setText(titleEl, (question ? "「" + question + "」 " : "") + hexName(main));
    setText(triEl, "상괘 " + tU.name + "(" + tU.hanja + tU.symbol + ") · 하괘 " + tL.name + "(" + tL.hanja + tL.symbol + ")");
    renderHexagram(hexEl, values);

    if (interpEl) {
      interpEl.innerHTML = "";
      var h3 = document.createElement("h3");
      setText(h3, "본괘 해석");
      var p = document.createElement("p");
      setText(p, main.text);
      var linesP = document.createElement("p");
      linesP.setAttribute("class", "line-summary");
      setText(linesP, "효의 흐름 — " + lineSummary(values));
      interpEl.appendChild(h3);
      interpEl.appendChild(p);
      interpEl.appendChild(linesP);
      if (changedHex) {
        var h3b = document.createElement("h3");
        setText(h3b, "지괘 — " + hexName(changedHex));
        var pb = document.createElement("p");
        /* one line: first sentence of the changed hexagram */
        setText(pb, "변효로 바뀌는 괘는 " + hexName(changedHex) + "입니다. " + changedHex.text.split(". ")[0] + ".");
        interpEl.appendChild(h3b);
        interpEl.appendChild(pb);
      }
    }

    if (wrap) {
      wrap.hidden = false;
      wrap.classList.add("show");
      if (wrap.scrollIntoView) wrap.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  /* ---- casting sequence ---- */
  var casting = false;

  function showCoins(coinsEl, shaking) {
    if (!coinsEl) return;
    coinsEl.hidden = false;
    var kids = coinsEl.children;
    for (var i = 0; i < kids.length; i++) {
      if (shaking) kids[i].classList.add("shake");
      else kids[i].classList.remove("shake");
    }
  }

  function setCoinFaces(toss) {
    for (var i = 0; i < 3; i++) {
      var c = $("juyeok-coin-" + i);
      if (c) setText(c, toss.coins[i]);
    }
  }

  async function castAll() {
    if (casting) return;
    var btn = $("juyeok-cast");
    var coinsEl = $("juyeok-coins");
    var logEl = $("juyeok-log");
    var wrap = $("juyeok-result");
    var qEl = $("juyeok-question");
    casting = true;
    if (btn) { btn.disabled = true; setText(btn, "괘를 뽑는 중…"); }
    if (wrap) wrap.hidden = true;
    if (logEl) logEl.innerHTML = "";

    var values = [];
    for (var i = 0; i < 6; i++) {
      var toss = tossLine();
      showCoins(coinsEl, true);
      await sleep(600);
      showCoins(coinsEl, false);
      setCoinFaces(toss);
      values.push(toss.value);
      if (logEl) {
        var row = document.createElement("div");
        row.setAttribute("class", "cast-line");
        setText(row, LINE_NAMES[i] + " — " + lineLabel(toss.value));
        logEl.appendChild(row);
      }
      await sleep(250);
    }
    if (coinsEl) coinsEl.hidden = true;

    var question = qEl ? qEl.value.trim() : "";
    renderResult(values, question);

    casting = false;
    if (btn) { btn.disabled = false; setText(btn, "다시 뽑기"); }
  }

  /* ---- init ---- */
  function init() {
    var form = $("juyeok-form");
    var btn = $("juyeok-cast");
    if (!form || !btn) return;
    form.addEventListener("submit", function (e) {
      if (e && e.preventDefault) e.preventDefault();
      castAll();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* expose for debugging only */
  window.JUYEOK = { castAll: castAll, HEXAGRAMS: HEXAGRAMS, TRIGRAMS: TRIGRAMS };
})();
