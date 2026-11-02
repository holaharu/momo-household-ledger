'use strict';
// Reference categories supplied by the household. Existing imported labels remain available.
const INCOME_CATEGORIES=['급여','상여금','아르바이트','용돈','금융수입','보험금','장학금','부동산','중고거래','SNS','앱테크','더치페이','물건팔기','술','여행팔기','에어비앤비','기타수입'];
const EXPENSE_CATEGORIES={
  '식비':['외식','카페/간식','음료','배달','식재료'],
  '생활':['생필품','마트','세탁','가구/가전'],
  '미용패션':['화장품','헤어샵','미용관리','의류','미용용품'],
  '교통':['택시','대중교통'],
  '자동차':['주유','주차','통행료','정비/수리','차량보험','대리운전'],
  '의료/건강':['약국','병원','건강용품','운동'],
  '금융':['보험','선불권/기프티콘','세금/과태료'],
  '여행/숙박':['숙박비','항공권','여행','여행용품','해외결제'],
  '취미':['술모으기','문화생활','각종구독료'],
  '엄마네':[],
  '주거/통신':['인터넷','휴대폰','관리비','가스비','이사비'],
  '반려동물':['동물병원','펫용품','사료/간식'],
  '경조/선물':['경조금','기부/헌금','훈종집','선물','회비']
};
function categoryChoices(type){
  const defaults=type==='수입'?INCOME_CATEGORIES:Object.keys(EXPENSE_CATEGORIES);
  return [...new Set([...defaults,...records.filter(r=>r.type===type).map(r=>r.category).filter(Boolean)])];
}
function subcategoryChoices(type,category){
  if(type==='수입')return [];
  return [...new Set([...(EXPENSE_CATEGORIES[category]||[]),...records.filter(r=>r.type===type&&r.category===category).map(r=>r.subcategory).filter(Boolean)])];
}
function fillCategorySelect(select,choices,value,placeholder){
  select.replaceChildren(new Option(placeholder,''));
  for(const choice of new Set([...choices,...(value?[value]:[])]))select.add(new Option(choice,choice));
  select.value=value||'';
}
function populateSubcategories(type,category,subcategory=''){
  const field=$('editForm').elements.subcategory,income=type==='수입';
  field.closest('label').hidden=income;
  field.disabled=income;
  fillCategorySelect(field,subcategoryChoices(type,category),income?'':subcategory,category?'소분류 선택 (선택사항)':'대분류를 먼저 선택');
}
function populateCategoryFields(type,category='',subcategory=''){
  fillCategorySelect($('editForm').elements.category,categoryChoices(type),category,'대분류 선택');
  populateSubcategories(type,category,subcategory);
}
$('editForm').elements.type.addEventListener('change',()=>populateCategoryFields($('editForm').elements.type.value));
$('editForm').elements.category.addEventListener('change',()=>populateSubcategories($('editForm').elements.type.value,$('editForm').elements.category.value));
populateCategoryFields($('editForm').elements.type.value);
