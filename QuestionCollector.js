// 요소를 클릭하는 함수
function clickElement(element) {
    element.click();
}

// 특정 ID의 요소로부터 텍스트를 검색하는 함수
function getTextFromId(id) {
    const element = document.getElementById(id);
    return element ? element.innerText : '';
}

// 특정 문자열로 끝나는 모든 요소 ID를 찾는 함수
function findElementIds(selector) {
    return Array.from(document.querySelectorAll(selector)).map(element => element.id);
}

// 부모 요소의 ID를 사용하여 클래스 `.actionTile`을 가진 자식 요소를 찾는 함수
function locateAnswerElement(parentId) {
    const parentElement = document.getElementById(parentId);
    return parentElement ? Array.from(parentElement.querySelectorAll('.actionTile')) : [];
}

// 전체 페이지를 크롤링하는 비동기 함수
async function crawlAllPages() {
    let currentPage = 0;
    const totalPages = findTotalPages(); // 총 페이지 수를 추정 또는 계산하는 함수
    let titleName = getTitleName();
    console.log(`현재 ${titleName}페이지를 보고 있습니다.`);
    console.log(`총 ${totalPages}페이지가 검색됐습니다. 크롤링을 시작합니다.`);
    
    let allText = ''; // 모든 페이지의 데이터를 저장할 변수
    allText += titleName;
    allText += "\n\n\n\n";
    while (currentPage < totalPages) {
        const currentPageData = await processQuestions(currentPage); // 현재 페이지의 질문 처리
        allText += currentPageData; // 수집된 데이터 추가
        currentPage++;
        if (currentPage < totalPages) {
            await goToPage(currentPage); // 다음 페이지로 이동
            await new Promise(resolve => setTimeout(resolve, 3000)); // 페이지 로딩 대기
        }
    }
    let orgdata = formatPageData(allText); 
    makeTextFileAndDownload(orgdata);
    //const downloadUrl = makeTextFileAndDownload(orgdata); // 모든 데이터를 한 파일로 생성
    //window.open(downloadUrl, '_blank'); // 생성된 파일 다운로드 URL을 열기
    console.log("처리 완료.");
}

// 전체 페이지 수를 추정 또는 계산하는 함수
function findTotalPages() {
    // 전체 페이지 수 추정 또는 계산 (예시: 페이지 버튼의 수)
    return document.querySelectorAll('[class^="pagerBtn_"]').length;
}

// 현재 페이지의 모든 질문을 처리하고 데이터를 수집하는 함수
async function processQuestions(pageNumber) {
    return new Promise(resolve => {
        const questionIds = findElementIds('[class*=questionItem]');
        let pageText = '';

        questionIds.forEach(id => {
            const actionTiles = locateAnswerElement(id);
            actionTiles.forEach(clickElement); // 답변을 보이기 위해 클릭
        });

        setTimeout(() => { // 클릭 후 데이터 로드를 위해 잠시 대기
            questionIds.forEach(id => {
                const questionText = getTextFromId(id);
                pageText += `${questionText}\n\n\n\n`;
            });
            resolve(pageText);
        }, 800);
    });
}

function getTitleName()
{
    // questions_cont 클래스를 가진 모든 요소 찾기
    const questionContainers = document.querySelectorAll('.questions_cont');

    // 각 questions_cont 요소 내의 title 클래스 텍스트 수집
    const titles = Array.from(questionContainers).map(container => {
        const titleElement = container.querySelector('.title');
        return titleElement ? titleElement.innerText : 'No title found';
    });

    return titles;
}

function goToPage(pageNumber) {
    // 'pagerBtn_X' 클래스를 이용하여 페이지 버튼을 선택합니다.
    const buttonClass = `pagerBtn_${pageNumber}`;
    const pageButtonContainer = document.querySelector(`.${buttonClass}`);
    
    if (pageButtonContainer) {
        const actionTile = pageButtonContainer.querySelector('.actionTile'); // 클릭 가능한 요소 선택
        if (actionTile) {
            actionTile.click();
            console.log(`다음 페이지로 이동합니다. ${pageNumber + 1}`);
        } else {
            console.log(`페이지 처리 오류 ${pageNumber + 1}`);
        }
    } else {
        console.log(` 페이지 버튼 초과 오류 ${pageNumber + 1}`);
    }
}
function formatPageData(data) {
    // 데이터를 원하는 포맷으로 정리
    data = data.replace(/CLOSE ANSWER AND EXPLANATION >\nCLOSE ANSWER AND EXPLANATION >/g, "");
    return data.replace(/CLOSE ANSWER AND EXPLANATION ×\nCLOSE ANSWER AND EXPLANATION ×/g, "");
}


// 문자열에서 텍스트 파일을 생성하고 다운로드 가능한 URL을 반환하며 파일을 자동으로 다운로드하는 함수
function makeTextFileAndDownload(text) {
    const data = new Blob([text], { type: 'text/plain;charset=utf8' });
    const textFile = window.URL.createObjectURL(data);
    
    // 파일 다운로드를 위한 a 태그 생성
    const downloadLink = document.createElement('a');
    downloadLink.href = textFile;
    downloadLink.download = `${getTitleName()}` + '.txt'; // 다운로드할 파일 이름 지정
    document.body.appendChild(downloadLink); // DOM에 a 태그 추가
    downloadLink.click(); // 링크 클릭 이벤트 실행
    document.body.removeChild(downloadLink); // a 태그 제거

    // 생성된 URL 반환
    return textFile;
}

// 스크립트 시작
crawlAllPages();