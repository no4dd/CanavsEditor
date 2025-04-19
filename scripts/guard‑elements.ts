// scripts/guard-elements.ts
import { Project, SyntaxKind } from 'ts-morph'

// 1) load your tsconfig
const project = new Project({ tsConfigFilePath: 'tsconfig.json' })
// 2) point at the file you want to refactor
const filePath = 'src/editor/core/command/CommandAdapt.ts'
const sourceFile = project.getSourceFileOrThrow(filePath)

// 3) ensure guards are imported
if (
  !sourceFile.getImportDeclaration((d) =>
    d.getModuleSpecifierValue().includes('../interface/Element')
  )
) {
  sourceFile.insertText(0, `
import {
  isOtherElement,
  isCitation
} from "../interface/Element";
`)
}

// 4) wrap style‐writes in isOtherElement()
const STYLE_PROPS = [
  'font',
  'size',
  'bold',
  'italic',
  'underline',
  'strikeout',
  'color',
  'highlight',
]
sourceFile.forEachDescendant((node) => {
  if (
    node.getKind() === SyntaxKind.PropertyAccessExpression &&
    STYLE_PROPS.includes((node as any).getName())
  ) {
    const loop = node.getFirstAncestorByKind(SyntaxKind.ForEachStatement)
    if (loop) {
      const varName =
        loop.getDeclarationList().getDeclarations()[0].getName()
      loop.getStatement().replaceWithText((old) =>
        `if (isOtherElement(${varName})) { ${old} }`
      )
    }
  }
})

// 5) wrap table‐internals in isOtherElement()
const TABLE_PROPS = ['trList','tdList','id']
sourceFile.forEachDescendant((node) => {
  if (
    node.getKind() === SyntaxKind.PropertyAccessExpression &&
    TABLE_PROPS.includes((node as any).getName())
  ) {
    const expr = node as any
    const obj = expr.getExpression().getText()
    const stmt = expr.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)
    if (stmt) {
      stmt.replaceWithText((old) =>
        `if (isOtherElement(${obj})) { ${old} }`
      )
    }
  }
})

// 6) write it back
sourceFile.saveSync()
console.log(`✅ Applied guards in ${filePath}`)
