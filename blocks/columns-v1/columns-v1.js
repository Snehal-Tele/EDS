export default function decorate(block) {
    [...block.children].forEach((row) => {
      [...row.children].forEach((col) => {
        // tag column containing an image
        const pic = col.querySelector('picture');
        if (pic) {
          col.classList.add('columns-img-col');
        }
   
        // tag the last paragraph if it contains a link (CTA)
        const paragraphs = col.querySelectorAll('p');
        const lastPara = paragraphs[paragraphs.length - 1];
        if (lastPara && lastPara.querySelector('a')) {
          lastPara.classList.add('columns-cta');
        }
      });
    });
  }