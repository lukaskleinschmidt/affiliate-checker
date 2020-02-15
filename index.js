const puppeteer = require('puppeteer');
const Listr = require('listr');
const fs = require('fs');

const {
    pages,
    partners,
    concurrent = false,
    collapse = true,
    headless = true,
} = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

async function followLink(link, follow = false, page) {
    let temp;

    switch (follow) {
        case 'click':

            temp = await page.browser().newPage();

            await temp.goto(page.url());
            await temp.$eval(`a[href="${link}"]`, a => a.target = '_self');
            await Promise.all([
                temp.waitForNavigation(),
                temp.click(`a[href="${link}"]`),
            ]);
            await temp.close();

            return temp.url();

        case 'goto':

            temp = await page.browser().newPage();

            await temp.goto(link);
            await temp.close();

            return temp.url();
    }

    return link;
}

function checkLink(link, params) {
    const searchParams = new URLSearchParams(link.substr(link.indexOf('?') + 1));

    return !Object.keys(params).some(param => {
        const expected = params[param];
        const value = searchParams.get(param);

        if (Array.isArray(expected)) {
            return !expected.includes(value);
        }

        return expected != value;
    });
}

function createLinkTask(url, page, { follow, params }) {
    async function task() {
        const link = await followLink(url, follow, page);

        if (!checkLink(link, params)) {
            return Promise.reject(new Error());
        }

        return Promise.resolve();
    }

    return {
        title: url.substring(0, 100) + (url.length > 100 ? '…' : ''),
        task,
    }
}

function createTask(url) {
    async function task({ browser }) {

        const page  = await browser.newPage();
        const tasks = [];

        // Open page to look for links in
        await page.goto(url);

        for (let n = 0; n < partners.length; n++) {
            const partner = partners[n];
            const links = await page.$$eval(`a[href*="${partner.selector}"]`, links => {
                return links.map(a => a.href);
            });

            tasks.push(...links.map(url => {
                return createLinkTask(url, page, partner);
            }));
        }

        await page.close();

        return new Listr(tasks, {
            exitOnError: false,
            concurrent,
        });
    }

    return {
        title: 'Checking ' + url,
        task,
    }
};

const tasks = new Listr(pages.map(createTask), {
    concurrent: false,
    collapse,
});

(async () => {
    const browser = await puppeteer.launch({ headless });

    await tasks.run({ browser }).catch(error => {});
    await browser.close();
})();
