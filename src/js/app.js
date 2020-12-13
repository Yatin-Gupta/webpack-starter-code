import 'jquery';
import '../css/main.css';
import '../scss/main.scss';
import {CONFIG} from './init';
import '../third.html';


jQuery(() => {
    CONFIG.pageHeading.textContent = CONFIG.pageHeadingMessage;
    console.log($("#page-heading").text());
});
