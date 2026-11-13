# 自動玩一局（只在本機跑）：python tools/e2e_play.py <輸出資料夾> [寬度]
import sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', line_buffering=True)
from playwright.sync_api import sync_playwright
OUT = sys.argv[1]; W = int(sys.argv[2]) if len(sys.argv) > 2 else 1280; errs = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': W, 'height': 900})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.route('**/script.google.com/**', lambda r: r.fulfill(status=200, body='{"marquee":["測試公告：跑馬燈正常"]}', headers={'content-type': 'application/json'}))
    pg.goto('http://127.0.0.1:8878/'); pg.evaluate('localStorage.clear()'); pg.reload(); pg.wait_for_timeout(600)
    shot = lambda n: pg.screenshot(path=os.path.join(OUT, n), full_page=True)
    pg.click('#modal .btn'); shot('s01_home.png')
    pg.fill('#newName', '咖啡小編阿凱'); pg.click('[data-act=start]')
    pg.click('[data-brand=cafe]'); pg.click('[data-act=next]')
    pg.click('[data-plat=ig]'); shot('s02_plat.png'); pg.click('[data-act=next]')
    pg.click('[data-tone=artsy]'); pg.click('[data-act=next]')
    pg.click('[data-aud=office]'); pg.click('[data-act=next]')
    for k in ['teach', 'daily', 'ask']: pg.click(f'[data-pillar={k}]')
    shot('s03_pillar.png'); pg.click('[data-act=next]')
    for q in ['food', 'copy', 'ad']: pg.click(f'[data-q={q}][data-a="0"]')
    shot('s04_quiz.png'); pg.click('[data-act=begin]'); pg.wait_for_timeout(300)
    shot('s05_month1.png')
    for m in range(16):
        st = pg.evaluate('_ses.G.stage')
        if st == 'end': break
        if st == 'crisis': pg.click('[data-act=stay]'); continue
        if pg.locator('[data-ev]').count(): pg.click('[data-ev="0"]')
        pg.click('[data-mat=ai]'); pg.click('[data-fmt=mix]'); pg.click('[data-reply=daily]')
        posts = 12 if pg.evaluate('_ses.G.stamina') > 70 else 8
        pg.click(f'[data-posts="{posts}"]')
        if m == 0: shot('s06_planned.png')
        pg.click('[data-act=run]')
        if m in (0, 6): shot(f's07_report_{m}.png')
        pg.click('[data-act=nextMonth]')
    pg.wait_for_timeout(400); shot('s08_end.png')
    print(pg.evaluate('JSON.stringify(SOC.finalScore(_ses.G))'))
    with pg.expect_popup() as pop: pg.click('.tcard[data-tool=coffee-ig-planner]')
    pop.value.close()
    print('stamps', pg.evaluate("localStorage.getItem('ses.stamps')"))
    print('scrollW', pg.evaluate('document.documentElement.scrollWidth'), 'clientW', pg.evaluate('document.documentElement.clientWidth'))
    print('errors', errs); b.close()
