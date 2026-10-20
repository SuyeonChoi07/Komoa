'use strict';
(() => {
  const screens=window.FIGMA_SCREENS;

  // The latest Figma record screen includes the attachment area between the
  // progress summary and the row/stitch counters.
  const recordTemplate=document.createElement('div');
  recordTemplate.innerHTML=screens['518:3255'].html;
  const recordRoot=recordTemplate.firstElementChild;
  const recordContent=recordRoot.querySelector('[data-node-id="518:3256"]');
  const counter=recordRoot.querySelector('[data-node-id="518:3272"]');
  const newProjectTemplate=document.createElement('div');
  newProjectTemplate.innerHTML=screens['518:3303'].html;
  const attachment=newProjectTemplate.querySelector('[data-name="첨부함 - 전"]').cloneNode(true);
  recordContent.insertBefore(attachment,counter);
  screens['518:3255']={...screens['518:3255'],height:1752,html:recordRoot.outerHTML};

  screens['660:4880']={
    id:'660:4880',
    name:'프로젝트 보기',
    width:430,
    height:976,
    html:`<div class="f0" data-node-id="660:4880" data-name="프로젝트 보기">
      <div class="project-view-content" data-node-id="660:4881">
        <div class="f79" data-node-id="660:4882" data-name="상세상단바">
          <div class="f80" data-node-id="I660:4882;373:3795" data-name="상단바">
            <div class="f81" data-node-id="I660:4882;373:3795;278:3726">
              <button class="f82" data-node-id="I660:4882;373:3795;278:3727" data-name="아이콘 / back"><img alt="" class="f77" src="assets/figma-exact/b7fba.svg"></button>
              <p class="f83" data-node-id="I660:4882;373:3795;278:3729">프로젝트 상세 보기</p>
            </div>
            <div class="f84" data-node-id="I660:4882;373:3795;278:3730" data-name="komoa-logo 1"><div class="f60"><img alt="" class="f85" src="assets/figma-exact/68c68.png"></div></div>
          </div>
        </div>
        <div class="project-view-photo" data-node-id="658:4859" data-name="사진"><img alt="" src="assets/figma-exact/5d84b.png"></div>
        <div class="project-view-title" data-node-id="660:4884" data-name="프로젝트 명"><p data-node-id="660:4885">프로젝트 이름</p></div>
        <div class="project-view-summary" data-node-id="660:4932">
          <div class="project-view-progress" data-node-id="658:4862" data-name="진행률">
            <div class="project-view-counts" data-node-id="658:4863" data-name="단코"><p data-node-id="658:4864">42 / 120단 · 86코</p><p data-node-id="658:4865">35%</p></div>
            <div class="project-view-progress-track" data-node-id="658:4866" data-name="프로그래스 바"><div data-node-id="658:4867" data-name="진행률 35%"></div></div>
          </div>
          <div class="f523" data-node-id="660:4899" data-name="진행 상태"><div class="f524" data-node-id="660:4900"><p class="f525" data-node-id="660:4901">진행 중</p></div><p class="f526" data-node-id="660:4902">2026.10.08  ~</p><p class="f527" data-node-id="660:4903">0000.00.00</p></div>
        </div>
        <div class="project-view-logs" data-node-id="660:4938" data-name="최근기록">
          <div class="f108" data-node-id="660:4939"><p class="f109" data-node-id="660:4940">작업 기록</p></div>
          <div class="f114" data-node-id="660:4948" data-name="상세정보"><p class="f115" data-node-id="660:4949">2026.09.17</p><p class="f116" data-node-id="660:4950">몸판 42단까지 떴어요. 실의 장력이 조금씩 일정해지고 있어요.</p></div>
          <div class="f114" data-node-id="660:4951" data-name="상세정보"><p class="f115" data-node-id="660:4952">2026.09.13</p><p class="f116" data-node-id="660:4953">몸판 30단까지 떴어요. 목 라인이 완성 되었어요.</p></div>
          <div class="f114" data-node-id="660:4954" data-name="상세정보"><p class="f115" data-node-id="660:4955">2026.09.10</p><p class="f116" data-node-id="660:4956">몸판 12단까지 떴어요. 케이블 무늬를 시작해요.</p></div>
        </div>
        <div class="f117" data-node-id="660:4913" data-name="작업 메모"><div class="project-view-note-title" data-node-id="660:4914"><p class="f118" data-node-id="660:4915">작업 메모</p></div><p class="f119" data-node-id="660:4919">작업하면서 잊지 말아야 할 것을 적어보세요</p></div>
      </div>
      <div class="f123" data-node-id="660:4920" data-name="배경"></div>
      <a class="f121" data-node-id="660:4921" data-name="Button"><p class="f19" data-node-id="I660:4921;239:1987">저장하기</p></a>
    </div>`
  };
})();
