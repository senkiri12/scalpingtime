export const config = { runtime: 'edge' };

export default async function handler(req) {
  try {
    const res = await fetch('https://www.forexfactory.com/ff_calendar_thisweek.xml', {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/xml, text/xml, */*',
      },
    });

    if (!res.ok) throw new Error('ForexFactory fetch failed');
    const xml = await res.text();

    // Parse XML manually - extract news items
    const items = [];
    const itemRegex = /<event>([\s\S]*?)<\/event>/g;
    let match;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 10) {
      const item = match[1];
      const get = (tag) => {
        const m = item.match(new RegExp(`<${tag}>(.*?)<\/${tag}>`));
        return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
      };
      items.push({
        title: get('title'),
        country: get('country'),
        date: get('date'),
        time: get('time'),
        impact: get('impact'),
        forecast: get('forecast'),
        previous: get('previous'),
      });
    }

    return new Response(JSON.stringify({ items }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 's-maxage=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message, items: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
}
