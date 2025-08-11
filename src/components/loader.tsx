const Loader = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="w-3 h-3 bg-neutral-500 rounded-full animate-left-swing"></span>
      <span className="w-3 h-3 bg-neutral-800 rounded-full animate-right-swing"></span>
    </div>
  )
}

export { Loader }
