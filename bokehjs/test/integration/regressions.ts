import {display, fig, row, column} from "./utils"

import {
  Arrow, ArrowHead, NormalHead, BoxAnnotation,
  DataRange1d, FactorRange,
  ColumnDataSource, CDSView, BooleanFilter, Selection,
  CategoricalAxis,
} from "@bokehjs/models"

import {Factor} from "@bokehjs/models/ranges/factor_range"

import {Color} from "@bokehjs/core/types"
import {Anchor, OutputBackend} from "@bokehjs/core/enums"
import {subsets} from "@bokehjs/core/util/iterator"
import {Random} from "@bokehjs/core/util/random"

describe("Bug", () => {
  describe("in issue #9879", () => {
    it("disallows to change FactorRange to a lower dimension with a different number of factors", async () => {
      const p = fig([200, 200], {
        title: null,
        toolbar_location: null,
        x_range: new FactorRange({factors: [["a", "b"], ["b", "c"]]}),
        y_range: new DataRange1d(),
      })
      const source = new ColumnDataSource({data: {x: [["a", "b"], ["b", "c"]], y: [1, 2]}})
      p.vbar({x: {field: "x"}, top: {field: "y"}, source})
      const {view} = await display(p, [250, 250])

      source.data = {x: ["a"], y: [1]}
      ;(p.x_range as FactorRange).factors = ["a"]
      await view.ready
    })
  })

  describe("in issue #9522", () => {
    it("disallows arrow to be positioned correctly in stacked layouts", async () => {
      const horz = (end?: ArrowHead) => new Arrow({x_start: 1, x_end: 5, y_start: 0, y_end:  0, end})
      const vert = (end?: ArrowHead) => new Arrow({x_start: 2, x_end: 2, y_start: 1, y_end: -2, end})

      const p1 = fig([200, 200], {x_range: [0, 6], y_range: [-3, 2]})
      p1.add_layout(horz(new NormalHead({fill_color: "blue"})))
      p1.add_layout(vert())

      const p2 = fig([200, 200], {x_range: [0, 6], y_range: [-3, 2]})
      p2.add_layout(horz())
      p2.add_layout(vert(new NormalHead({fill_color: "green"})))

      await display(row([p1, p2]), [450, 250])
    })
  })

  describe("in issue #9703", () => {
    it.allowing(6)("disallows ImageURL glyph to set anchor and angle at the same time", async () => {
      const p = fig([300, 300], {x_range: [-1, 10], y_range: [-1, 10]})

      const svg = `\
<svg version="1.1" viewBox="0 0 2 2" xmlns="http://www.w3.org/2000/svg">
  <path d="M 0,0 2,0 1,2 Z" fill="green" />
</svg>
`
      const img = `data:image/svg+xml;utf-8,${svg}`

      let y = 0
      const w = 1, h = 1

      for (const anchor of Anchor) {
        p.image_url({url: [img], x: 0, y, w, h, anchor, angle: 0})
        p.image_url({url: [img], x: 1, y, w, h, anchor, angle: Math.PI/6})
        p.image_url({url: [img], x: 2, y, w, h, anchor, angle: Math.PI/4})
        p.image_url({url: [img], x: 3, y, w, h, anchor, angle: Math.PI/3})
        p.image_url({url: [img], x: 4, y, w, h, anchor, angle: Math.PI/2})
        p.image_url({url: [img], x: 5, y, w, h, anchor, angle: Math.PI/1})
        y += 1
      }

      await display(p, [350, 350])
    })
  })

  describe("in issue #9724", () => {
    it("makes automatic padding in data ranges inconsistent", async () => {
      const x = [0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]

      const padding = {
        range_padding: 1,
        range_padding_units: "absolute" as const,
      }

      const p0 = (() => {
        const x_range = new DataRange1d()
        const y_range = new DataRange1d(padding)
        const p = fig([150, 150], {x_range, y_range})
        p.line({x, y: 10, line_width: 2, color: "red"})
        return p
      })()

      const p1 = (() => {
        const x_range = new DataRange1d()
        const y_range = new DataRange1d(padding)
        const p = fig([150, 150], {x_range, y_range})
        p.line({x, y: 10, line_width: 2, color: "red"})
        p.line({x, y: 15, line_width: 2, color: "blue"})
        return p
      })()

      const p2 = (() => {
        const x_range = new DataRange1d()
        const y_range = new DataRange1d({start: 0, ...padding})
        const p = fig([150, 150], {x_range, y_range})
        p.line({x, y: 10, line_width: 2, color: "red"})
        return p
      })()

      const p3 = (() => {
        const x_range = new DataRange1d()
        const y_range = new DataRange1d({start: 0, ...padding})
        const p = fig([150, 150], {x_range, y_range})
        p.line({x, y: 10, line_width: 2, color: "red"})
        p.line({x, y: 15, line_width: 2, color: "blue"})
        return p
      })()

      await display(row([p0, p1, p2, p3]), [650, 200])
    })
  })

  describe("in issue #9877", () => {
    function plot(fill: Color | null, line: Color | null) {
      const p = fig([200, 200], {x_range: [0, 3], y_range: [0, 3]})
      p.circle({x: [1, 1, 2, 2], y: [1, 2, 1, 2], radius: 0.5, line_color: null, fill_color: "red"})

      const box = new BoxAnnotation({
        bottom: 1, top: 2, left: 1, right: 2,
        fill_color: fill, fill_alpha: 0.5,
        line_color: line, line_alpha: 1.0, line_width: 4,
      })
      p.add_layout(box)
      return p
    }

    it("disallows BoxAnnotation to respect fill_color == null", async () => {
      const p0 = plot("blue", "green")
      const p1 = plot(null, "green")
      await display(row([p0, p1]), [450, 250])
    })

    it("disallows BoxAnnotation to respect line_color == null", async () => {
      const p0 = plot("blue", "green")
      const p1 = plot("blue", null)
      await display(row([p0, p1]), [450, 250])
    })
  })

  describe("in issue #9230", () => {
    function plot(output_backend: OutputBackend, selected?: Selection) {
      const p = fig([200, 200], {tools: "box_select", output_backend})
      const x = [0, 1, 2, 3]
      const y = [0, 1, 2, 3]
      const c = ["black", "red", "green", "blue"]
      const source = new ColumnDataSource({data: {x, y, c}, selected})
      const view = new CDSView({source, filters: [new BooleanFilter({booleans: [false, true, true, true]})]})
      p.circle({field: "x"}, {field: "y"}, {source, view, color: {field: "c"}, size: 20})
      return p
    }

    it("makes GlyphRenderer use incorrect subset indices", async () => {
      const p0 = plot("canvas")
      const p1 = plot("webgl")
      await display(row([p0, p1]), [400, 200])
    })

    it("makes GlyphRenderer use incorrect subset indices after selection", async () => {
      const items = []
      for (const indices of subsets([1, 2, 3])) {
        const selection = new Selection({indices})
        const p0 = plot("canvas", selection)
        const p1 = plot("webgl", selection)
        items.push(column([p0, p1]))
      }
      await display(row(items), [200*items.length + 50, 450])
    })
  })

  describe("in issue #10042", () => {
    it("disallows to set subgroup_label_orientation = 0", async () => {
      const random = new Random(1)

      const factors: Factor[] = [
        ["A", "01", "AA"], ["A", "01", "AB"], ["A", "01", "AC"], ["A", "01", "AD"], ["A", "01", "AE"],
        ["B", "02", "AA"], ["B", "02", "AB"], ["B", "02", "AC"], ["B", "02", "AD"], ["B", "02", "AE"],
      ]
      const y_range = new FactorRange({factors})

      const p = fig([200, 300], {y_range})
      p.hbar({
        y: factors,
        left: 0,
        right: random.floats(factors.length),
        height: 0.8,
      })
      p.yaxis.forEach((axis: CategoricalAxis) => axis.subgroup_label_orientation = 0)

      await display(p, [200, 300])
    })
  })

  describe("in issue #10219", () => {
    it("disallows correct placement of Rect glyph with partial categorical ranges", async () => {
      const source = new ColumnDataSource({data: {
        x: ["A", "A", "A", "B", "B", "B", "C", "C", "C"],
        y: ["A", "B", "C", "A", "B", "C", "A", "B", "C"],
      }})

      const p = fig([300, 300], {x_range: ["B", "C"], y_range: ["C", "B"]})

      p.rect({x: {field: "x"}, y: {field: "y"}, width: 0.9, height: 0.9, source})
      p.circle({x: {field: "x"}, y: {field: "y"}, radius: 0.2, color: "red", source})

      await display(p, [350, 350])
    })
  })
})
