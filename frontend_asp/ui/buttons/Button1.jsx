import React from "react";

export default function Button1({ button1, link }) {
  const content = (
    <button className="flex items-center duration-200 pl-8 bg-red-500 justify-between border overflow-hidden border-gray-800 rounded-sm font-semibold text-white hover:text-black w-fit hover:bg-white  transition group">
      {button1}
      <p className="pb-2 px-4 ml-8 duration-200 text-4xl flex items-center justify-center bg-white text-black group-hover:bg-black group-hover:text-white transition">
        »
      </p>
    </button>
  );

  // Rendering <a> without an href is not a real link (not focusable/keyboard
  // accessible, does nothing on click) — several buttons across the site were
  // silently broken this way because `link` was never passed in. Falling back
  // to a plain button in that case at least fails safely instead of looking
  // clickable while doing nothing.
  if (!link) return content;

  return <a href={link}>{content}</a>;
}
