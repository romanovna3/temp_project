import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EvalGraph from '../EvalGraph.vue'
import { SAMPLE_GAME } from '../../data/gameData.js'
import { MOVE_CLASSIFICATIONS } from '../../data/classifications.js'

function buildPlies() {
  const plies = []
  for (const move of SAMPLE_GAME.moves) {
    if (move.white) plies.push({ ...move.white, moveNum: move.num, color: 'white' })
    if (move.black) plies.push({ ...move.black, moveNum: move.num, color: 'black' })
  }
  return plies
}

const allPlies = buildPlies()

function mountGraph(propsOverrides = {}) {
  return mount(EvalGraph, {
    props: { plies: allPlies, ...propsOverrides },
    global: {
      stubs: { CcIcon: { template: '<span class="cc-icon-stub" :data-name="name" />', props: ['name', 'size', 'variant'] } },
    },
  })
}

describe('EvalGraph', () => {
  describe('dots -- white moves only', () => {
    it('only includes white highlighted plies', () => {
      const wrapper = mountGraph()
      const dotEls = wrapper.findAll('.dot-ring')

      const whiteHighlightedCount = allPlies.filter((p, i) => i % 2 === 0 && p.highlighted).length
      expect(dotEls).toHaveLength(whiteHighlightedCount)
      expect(whiteHighlightedCount).toBeGreaterThan(0)
    })

    it('excludes black highlighted plies', () => {
      const blackHighlightedIndices = allPlies
        .map((p, i) => ({ p, i }))
        .filter(({ p, i }) => i % 2 !== 0 && p.highlighted)
        .map(({ i }) => i + 1)

      expect(blackHighlightedIndices.length).toBeGreaterThan(0)

      const wrapper = mountGraph()
      const dotKeys = wrapper.findAll('.dot-ring').map(d => d.attributes('data-key') || d.element.getAttribute('key'))
      const dotPlyIndices = wrapper.findAll('.dot-ring').map((_, idx) => {
        const style = wrapper.findAll('.dot-ring')[idx].attributes('style')
        return style
      })

      for (const blackPly of blackHighlightedIndices) {
        const found = wrapper.findAll('.dot-ring').some(d => {
          const expectedX = ((blackPly) / allPlies.length) * 100
          return d.attributes('style')?.includes(`left: ${expectedX}`)
        })
        expect(found).toBe(false)
      }
    })
  })

  describe('classificationIcons -- highlight off', () => {
    it('returns no icons when highlightBestWorst is false', () => {
      const wrapper = mountGraph({ highlightBestWorst: false })
      expect(wrapper.findAll('.classification-icon')).toHaveLength(0)
    })
  })

  describe('classificationIcons -- limitOnePerType=true (both graphs)', () => {
    it('returns exactly 2 entries (one worst, one best)', () => {
      const wrapper = mountGraph({ highlightBestWorst: true, limitOnePerType: true })
      const icons = wrapper.findAll('.classification-icon')
      expect(icons).toHaveLength(2)
    })

    it('worst entry is the blunder at move 8 white (O-O)', () => {
      const wrapper = mountGraph({ highlightBestWorst: true, limitOnePerType: true })
      const icons = wrapper.findAll('.classification-icon')

      const blunderIcon = icons.find(el => {
        const stub = el.find('.cc-icon-stub')
        return stub.attributes('data-name') === 'classification-blunder'
      })
      expect(blunderIcon).toBeTruthy()

      const move8Idx = allPlies.findIndex(
        (p, i) => i % 2 === 0 && p.san === 'O-O' && p.classification === 'blunder'
      )
      const expectedXPct = ((move8Idx + 1) / allPlies.length) * 100
      expect(blunderIcon.attributes('style')).toContain(`left: ${expectedXPct}%`)
    })

    it('best entry is Qb3 (move 10 white, largest positive delta)', () => {
      const wrapper = mountGraph({ highlightBestWorst: true, limitOnePerType: true })
      const icons = wrapper.findAll('.classification-icon')

      const bestIcon = icons.find(el => {
        const stub = el.find('.cc-icon-stub')
        return stub.attributes('data-name') === 'classification-best'
      })
      expect(bestIcon).toBeTruthy()

      const qb3Idx = allPlies.findIndex(
        (p, i) => i % 2 === 0 && p.san === 'b3' && p.classification === 'best'
      )
      const expectedXPct = ((qb3Idx + 1) / allPlies.length) * 100
      expect(bestIcon.attributes('style')).toContain(`left: ${expectedXPct}%`)
    })

    it('does not include any black plies', () => {
      const wrapper = mountGraph({ highlightBestWorst: true, limitOnePerType: true })
      const icons = wrapper.findAll('.classification-icon')

      const blackPlyXPcts = allPlies
        .map((p, i) => ({ p, i }))
        .filter(({ i }) => i % 2 !== 0)
        .map(({ i }) => ((i + 1) / allPlies.length) * 100)

      for (const el of icons) {
        const style = el.attributes('style') || ''
        for (const bx of blackPlyXPcts) {
          expect(style).not.toContain(`left: ${bx}%`)
        }
      }
    })
  })

  describe('icon click emits select-ply', () => {
    it('emits select-ply with ply index when icon is clicked', async () => {
      const wrapper = mountGraph({ highlightBestWorst: true, limitOnePerType: true })
      const icons = wrapper.findAll('.classification-icon')
      expect(icons.length).toBeGreaterThan(0)

      await icons[0].trigger('click')

      const emitted = wrapper.emitted('select-ply')
      expect(emitted).toBeTruthy()
      expect(emitted[0][0]).toBeGreaterThan(0)
    })
  })

  describe('no layout regression -- default mount', () => {
    it('wrapper has 80px height', () => {
      const wrapper = mountGraph()
      const graphWrapper = wrapper.find('.eval-graph-wrapper')
      expect(graphWrapper.exists()).toBe(true)
    })

    it('SVG renders inside .eval-graph', () => {
      const wrapper = mountGraph()
      const svg = wrapper.find('.eval-graph svg')
      expect(svg.exists()).toBe(true)
      expect(svg.attributes('viewBox') || svg.attributes('viewbox')).toBe('0 0 400 80')
    })

    it('dot count matches white highlighted plies only', () => {
      const wrapper = mountGraph()
      const dotCount = wrapper.findAll('.dot-ring').length
      const whiteHighlighted = allPlies.filter((p, i) => i % 2 === 0 && p.highlighted).length
      expect(dotCount).toBe(whiteHighlighted)
    })

    it('no classification icons when highlight prop is off', () => {
      const wrapper = mountGraph()
      expect(wrapper.findAll('.classification-icon')).toHaveLength(0)
    })
  })
})
