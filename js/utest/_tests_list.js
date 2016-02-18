var tests_list = [
   // 'test_About',
    'test_Captcha',
    'test_Card',
    'test_Categories',
    'test_Checkout',
    'test_ChildProducts',
    'test_CollectionSort',
   // 'test_Customers',
    'test_Delivery',
    'test_Errors',
    'test_Establishments',
    'test_Filters',
    'test_Geopoint',
    'test_Giftcard',
    'test_Locale',
    'test_Log',
    'test_Modifiers',
   // 'test_Myorder',
    'test_Products',
    'test_ProductSets',
    'test_Rewards',
    'test_Search',
    'test_Settings',
    'test_StanfordCard',
    'test_Subcategories',
    'test_Tax',
    'test_TimeFrm',
    'test_Timetable',
    'test_Tips',
    'test_Total'
];

if (!window._phantom) {
    for(var key in tests_list) {
       tests_list[key] = "../core/js/utest/" + tests_list[key];
    }
} else {
    for(var key in tests_list) {
       tests_list[key] = "base/js/utest/" + tests_list[key] + ".js";
    }
}
